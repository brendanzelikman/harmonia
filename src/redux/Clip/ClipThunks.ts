import * as _ from "redux/selectors";
import { Thunk } from "types/Project";
import { Midi } from "@tonejs/midi";
import {
  Clip,
  ClipId,
  PatternClipId,
  PoseClipId,
  initializeClip,
} from "types/Clip";
import { _sliceClip } from "./ClipSlice";
import { updateMediaSelection } from "redux/Timeline/TimelineSlice";
import { isUndefined, without } from "lodash";
import { getPatternMidiChordNotes, isPatternMidiChord } from "types/Pattern";
import { convertTicksToSeconds } from "types/Transport";
import { hasKeys } from "utils/objects";
import { Tick } from "types/units";

/** Slice a clip and make sure the old ID is no longer selected. */
export const sliceClip =
  (clip?: Clip, tick: Tick = 0): Thunk =>
  (dispatch, getProject) => {
    if (!clip) return;
    const project = getProject();
    const { patternClipIds, poseClipIds } = _.selectMediaSelection(project);
    const duration = _.selectClipDuration(project, clip?.id);

    // Find the tick to split the clip at
    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === duration) return;
    if (splitTick < 0 || splitTick > clip.tick + duration) return;

    // Get the two new clips
    const firstClip = initializeClip({ ...clip, duration: splitTick });
    const secondClip = initializeClip({
      ...clip,
      tick,
      offset: (clip.offset || 0) + splitTick,
      duration: duration - splitTick,
    });

    // Slice the clip
    dispatch(_sliceClip({ oldClip: clip, firstClip, secondClip }));

    // Filter the old clip out of the media selection
    dispatch(
      updateMediaSelection({
        patternClipIds: without(patternClipIds, clip.id) as PatternClipId[],
        poseClipIds: without(poseClipIds, clip.id) as PoseClipId[],
      })
    );
  };

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (ids: ClipId[]): Thunk =>
  async (_dispatch, getProject) => {
    const project = getProject();
    const meta = _.selectMetadata(project);
    const transport = _.selectTransport(project);
    const trackIds = _.selectTrackIds(project);
    const clipStreamMap = _.selectPatternClipStreamMap(project);
    if (!hasKeys(clipStreamMap)) return;

    // Prepare a new MIDI file
    const midi = new Midi();

    // Iterate through each track
    trackIds.forEach((trackId) => {
      const clips = _.selectClipsByTrackIds(project, [trackId]);
      if (!clips.length) return;

      // Create a MIDI track and add each clip
      const midiTrack = midi.addTrack();
      clips.forEach((clip) => {
        // Get the stream of the clip
        const startTime = _.selectClipStartTime(project, clip.id);
        const stream = clipStreamMap[clip.id];
        if (isUndefined(startTime) || isUndefined(stream)) return;

        // Iterate through each block
        for (let i = 0; i < stream.length; i++) {
          const block = stream[i];

          // Skip the block if it's a rest or empty
          if (!isPatternMidiChord(block)) continue;
          const notes = getPatternMidiChordNotes(block);
          if (!notes.length) continue;

          // Get the current time of the block
          const time = startTime + convertTicksToSeconds(transport, i);

          // Add each note to the MIDI track
          for (const note of notes) {
            const { MIDI, duration, velocity } = note;
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
    a.download = `${meta.name || "file"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
