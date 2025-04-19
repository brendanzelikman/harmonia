import { Midi } from "@tonejs/midi";
import { Tick } from "types/units";
import { selectPatternClipsByIds, selectTimedClipById } from "./ClipSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import {
  ClipId,
  PortaledClipId,
  isPatternClipId,
  PatternClipId,
} from "./ClipTypes";
import { selectPortaledPatternClipStreamMap } from "types/Arrangement/ArrangementSelectors";
import {
  selectTrackClipIds,
  selectTrackPortaledClipIdsMap,
} from "types/Arrangement/ArrangementTrackSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { Payload, unpackData, unpackUndoType } from "types/redux";
import { removeClip } from "./ClipSlice";
import { downloadBlob } from "utils/event";
import {
  selectTrackDescendantIds,
  selectTrackLabelById,
  selectTracks,
} from "types/Track/TrackSelectors";
import { ticksToSeconds } from "utils/duration";
import { TrackId } from "types/Track/TrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { createMedia } from "types/Media/MediaThunks";

// ------------------------------------------------------------
// Clip Timeline Thunks
// ------------------------------------------------------------

/** Slice a clip and make sure the old ID is no longer selected. */
export const sliceClip =
  (payload: Payload<{ id: PortaledClipId | ClipId; tick: Tick }>): Thunk =>
  (dispatch, getProject) => {
    const { tick, id: _id } = unpackData(payload);
    const undoType = unpackUndoType(payload, "sliceClip");
    const id = getOriginalIdFromPortaledClip(_id);
    const clip = selectTimedClipById(getProject(), id);
    if (!clip) return;

    // Find the tick to split the clip at
    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === clip.duration) return;
    if (splitTick < 0 || splitTick > clip.tick + clip.duration) return;

    // Get the two new clips
    const firstClip = { ...clip, duration: splitTick };
    const offset = (clip.offset || 0) + splitTick;
    const duration = clip.duration - splitTick;
    const secondClip = { ...clip, tick, offset, duration };

    // Slice the clip
    dispatch(removeClip({ data: id, undoType }));
    dispatch(
      createMedia({ data: { clips: [firstClip, secondClip] }, undoType })
    );
  };

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
