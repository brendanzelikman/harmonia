import { Midi } from "@tonejs/midi";
import { clamp } from "lodash";
import { Tick } from "types/units";
import {
  selectClipById,
  selectPatternClipById,
  selectPatternClips,
  selectTimedClipById,
} from "./ClipSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { initializeClip, ClipId, PatternClipId } from "./ClipTypes";
import { selectPortaledPatternClipStreamMap } from "types/Arrangement/ArrangementSelectors";
import {
  selectTrackClipIds,
  selectTrackPortaledClipIdsMap,
} from "types/Arrangement/ArrangementTrackSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import {
  selectTransport,
  selectTransportBPM,
} from "types/Transport/TransportSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { addClips, removeClip, updateClip } from "./ClipSlice";
import {
  selectMediaSelection,
  selectSelectedPatternClips,
} from "types/Timeline/TimelineSelectors";
import { removeClipIdsFromSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { promptUserForString } from "utils/html";
import {
  selectTracks,
  selectTrackById,
  selectTrackDescendantIds,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import {
  createEighthNote,
  createEighthRest,
  DURATION_TICKS,
  getTickDuration,
  secondsToTicks,
  SixteenthNoteTicks,
  ticksToSeconds,
} from "utils/durations";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import {
  PatternId,
  PatternMidiNote,
  PatternStream,
} from "types/Pattern/PatternTypes";
import { updatePattern } from "types/Pattern/PatternSlice";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { getMidiFromPitch } from "utils/midi";
import { TrackId } from "types/Track/TrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getPatternChordWithNewNotes } from "types/Pattern/PatternUtils";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";

/** Open or close the dropdown of a clip */
export const toggleClipDropdown =
  (payload: Payload<{ id: ClipId; value?: boolean }>): Thunk =>
  (dispatch, getProject) => {
    const { id, value } = payload.data;
    const project = getProject();
    const undoType = unpackUndoType(payload, "toggleClipDropdown");
    const clip = selectClipById(project, id);
    if (!clip) return;
    const newValue = value === undefined ? !clip.isOpen : value;
    dispatch(updateClip({ data: { id, isOpen: newValue }, undoType }));
  };

/** Slice a clip and make sure the old ID is no longer selected. */
export const sliceClip =
  (payload: Payload<{ id: ClipId; tick: Tick }>): Thunk =>
  (dispatch, getProject) => {
    const { tick } = payload.data;
    const id = getOriginalIdFromPortaledClip(payload.data.id);
    if (!id) return;

    const project = getProject();
    const clip = selectTimedClipById(project, id);
    if (!clip) return;

    const mediaSelection = selectMediaSelection(project);
    const undoType = unpackUndoType(payload, "sliceClip");

    // Find the tick to split the clip at
    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === clip.duration) return;
    if (splitTick < 0 || splitTick > clip.tick + clip.duration) return;

    // Get the two new clips
    const firstClip = initializeClip({ ...clip, duration: splitTick });
    const offset = (clip.offset || 0) + splitTick;
    const duration = clip.duration - splitTick;
    const secondClip = initializeClip({ ...clip, tick, offset, duration });

    // Filter the old clip out of the media selection
    const { clipIds } = mediaSelection;
    if (clipIds?.length) {
      dispatch(removeClipIdsFromSelection({ data: [id] }));
    }
    // Slice the clip
    dispatch(removeClip({ data: clip.id, undoType }));
    dispatch(addClips({ data: [firstClip, secondClip], undoType }));
  };

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (
    ids: ClipId[],
    options: { filename?: string; download?: boolean } = { download: true }
  ): Thunk<Blob> =>
  (_dispatch, getProject) => {
    const project = getProject();
    const meta = selectMeta(project);

    const clips = ids
      .map((id) => selectClipById(project, id))
      .filter((clip) => !!clip && clip.type === "pattern");
    const tracks = selectTracks(project).filter((track) =>
      clips.some((clip) => clip?.trackId === track.id)
    );
    const trackClipIdMap = selectTrackPortaledClipIdsMap(project);
    const clipStreamMap = selectPortaledPatternClipStreamMap(project);

    // Prepare a new MIDI file
    const midi = new Midi();
    const bpm = selectTransportBPM(project);
    midi.header.setTempo(bpm);

    // Iterate through each track
    tracks.forEach((track, i) => {
      const clipIds = trackClipIdMap[track.id];
      if (!clipIds.length) return;

      // Create a MIDI track
      const midiTrack = midi.addTrack();
      midiTrack.name = `Track ${selectTrackLabelById(project, track.id)}`;
      midiTrack.channel = i;

      // Add each clip to the MIDI track
      clipIds.forEach((clipId) => {
        // Get the stream of the clip
        const stream = clipStreamMap[clipId];
        const streamLength = stream?.length ?? 0;
        if (!streamLength) return;

        // Iterate through each block
        for (let i = 0; i < streamLength; i++) {
          const { notes, startTick } = stream[i];
          if (!notes.length) continue;

          // Get the current time of the block
          const time = ticksToSeconds(startTick, bpm);

          // Add each note to the MIDI track
          for (const note of notes) {
            const { MIDI, velocity } = note;
            const duration = ticksToSeconds(note.duration, bpm);
            midiTrack.addNote({ midi: MIDI, duration, time, velocity });
          }
        }
      });
    });

    // Create a MIDI blob
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);

    // Download the MIDI file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options?.filename ?? meta.name ?? "file"}.mid`;
    if (options?.download) a.click();
    URL.revokeObjectURL(url);
    return blob;
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportTrackToMIDI =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clipIds: ClipId[] = [];
    const track = selectTrackById(project, trackId);
    if (!track) return;

    if (isScaleTrackId(trackId)) {
      const ids = [trackId, ...selectTrackDescendantIds(project, trackId)];
      clipIds.push(...ids.flatMap((id) => selectTrackClipIds(project, id)));
    } else {
      clipIds.push(...selectTrackClipIds(project, track.id));
    }

    dispatch(exportClipsToMidi(clipIds));
  };

export const importPatternFromMIDI =
  (id: PatternClipId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);
    const clip = selectPatternClipById(project, id);
    if (!clip) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mid";
    input.addEventListener("change", async (e) => {
      const files = (e.target as HTMLInputElement).files ?? [];
      const file = files[0];
      if (!file) return;
      const buffer = await file.arrayBuffer();
      const midi = new Midi(buffer);
      if (midi.tracks.length === 0) return;

      // Assume MIDI notes are sorted by time (they should be)
      // Group notes into chords by time
      const chords = midi.tracks[0].notes
        .map((note) => ({
          MIDI: note.midi,
          duration: note.duration,
          velocity: Math.round(note.velocity * 127),
          time: note.time,
        }))
        .reduce((acc, note) => {
          const last = acc[acc.length - 1];
          if (last && last.time === note.time) {
            last.notes.push(note);
          } else {
            acc.push({ time: note.time, notes: [note] });
          }
          return acc;
        }, [] as { time: number; notes: PatternMidiNote[] }[]);

      // Cut off durations if times overlap
      const boundChords = chords.map(({ time, notes }, i) => {
        const nextChord = chords[i + 1];
        return notes.map((note) => {
          const duration = nextChord
            ? clamp(note.duration, 0, nextChord.time - time)
            : note.duration;
          const rawTicks = secondsToTicks(duration, transport.bpm);
          const durationType = getTickDuration(rawTicks);
          if (durationType) return { ...note, duration: rawTicks };
          const bestMatch =
            Object.values(DURATION_TICKS).find(
              (d) => Math.abs(rawTicks - d) <= 3
            ) ?? SixteenthNoteTicks;
          return { ...note, duration: bestMatch };
        });
      });

      // Autobind each chord to the clip's track
      const stream = boundChords.map((chord) =>
        chord.length > 1
          ? getPatternChordWithNewNotes(chord, (notes) =>
              notes.map((note) =>
                dispatch(autoBindNoteToTrack(clip.trackId, note))
              )
            )
          : dispatch(autoBindNoteToTrack(clip.trackId, chord[0]))
      );

      // Update the pattern with the new stream
      dispatch(updatePattern({ data: { id: clip.patternId, stream } }));
    });
    input.click();
    input.remove();
  };

export const inputPatternStream =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      title: "Update the Selected Pattern",
      description: `Please input a list of notes separated by spaces to update the selected pattern, e.g. "60 64 67".`,
      callback: (input) => {
        const project = getProject();
        const patternClips = selectPatternClips(project);
        const selectedClips = selectSelectedPatternClips(project);
        const clip = id
          ? patternClips.find((clip) => clip.patternId === id)
          : selectedClips[0];
        if (!clip) return;

        const notes: PatternStream = [];
        const regex = /(\d+|[A-G]#?\d?)/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(input)) !== null) {
          const token = match[1];
          const isNumber = /^\d+$/.test(token);
          const midi = isNumber ? parseInt(token, 10) : getMidiFromPitch(token);
          const isRest = midi <= 0;
          if (isRest) {
            notes.push(createEighthRest());
          } else {
            const note = createEighthNote(midi);
            notes.push(dispatch(autoBindNoteToTrack(clip?.trackId, note)));
          }
        }

        const pattern = selectPatternById(project, clip.patternId);
        const stream = [...pattern.stream, ...notes];
        dispatch(updatePattern({ id: pattern.id, stream }));
      },
    })();
