import { Midi } from "@tonejs/midi";
import { selectPortaledPatternClipStreamMap } from "types/Arrangement/ArrangementSelectors";
import {
  selectTrackPortaledClipIdsMap,
  selectTrackClipIds,
} from "types/Arrangement/ArrangementTrackSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import {
  selectTracks,
  selectTrackLabelById,
  selectTrackDescendantIds,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { ticksToSeconds } from "utils/duration";
import { downloadBlob } from "utils/event";
import { selectPatternClipsByIds } from "./ClipSelectors";
import { ClipId, isPatternClipId, PatternClipId } from "./ClipTypes";

// ------------------------------------------------------------
// Clip MIDI Thunks
// ------------------------------------------------------------

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (
    ids: ClipId[],
    options: { filename?: string; download?: boolean } = { download: true }
  ): Thunk<Blob> =>
  (_dispatch, getProject) => {
    const project = getProject();
    const meta = selectMeta(project);
    const trackClipIdMap = selectTrackPortaledClipIdsMap(project);
    const clipStreamMap = selectPortaledPatternClipStreamMap(project);

    // Get all tracks that belong to the clips
    const patternClipIds = ids.filter(isPatternClipId);
    const clips = selectPatternClipsByIds(project, patternClipIds);
    const allTracks = selectTracks(project);
    const tracks = allTracks.filter((track) =>
      clips.some((clip) => clip.trackId === track.id)
    );

    // Prepare a new MIDI file
    const midi = new Midi();
    const bpm = selectTransportBPM(project);
    midi.header.setTempo(bpm);

    // Iterate through each track
    tracks.forEach((track, i) => {
      const clipIds = trackClipIdMap[track.id].filter(
        isPatternClipId
      ) as PatternClipId[];
      if (!clipIds.length) return;

      // Create a MIDI track
      const midiTrack = midi.addTrack();
      midiTrack.name = `Track ${selectTrackLabelById(project, track.id)}`;
      midiTrack.channel = i;

      // Iterate over every stream of every clip
      clipIds.forEach((clipId) => {
        const stream = clipStreamMap[clipId];
        for (let i = 0; i < stream.length; i++) {
          const { notes, startTick } = stream[i];
          if (!notes.length) continue;

          // Get the current time of the block
          const time = ticksToSeconds(startTick, bpm);

          // Add each note to the MIDI track with its time
          for (const note of notes) {
            if (!("MIDI" in note)) continue;
            const { MIDI, velocity } = note;
            const duration = ticksToSeconds(note.duration, bpm);
            midiTrack.addNote({ midi: MIDI, duration, time, velocity });
          }
        }
      });
    });

    // Create a MIDI blob and download it if requested
    const blob = new Blob([midi.toArray()], { type: "audio/midi" });
    if (options?.download) {
      const name = options?.filename ?? meta.name ?? "file";
      downloadBlob(blob, `${name}.mid`);
    }
    return blob;
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportTrackClipsToMIDI =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // If the track is a scale track, export all of its descendants
    if (isScaleTrackId(trackId)) {
      const trackIds = [trackId, ...selectTrackDescendantIds(project, trackId)];
      const clipIds = trackIds.flatMap((id) => selectTrackClipIds(project, id));
      dispatch(exportClipsToMidi(clipIds));
      return;
    }

    // Otherwise, just export the track's clips
    const clipIds = selectTrackClipIds(project, trackId);
    dispatch(exportClipsToMidi(clipIds));
  };
