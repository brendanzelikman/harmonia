import { createDeepSelector, createArraySelector } from "lib/redux";
import { Project } from "types/Project/ProjectTypes";
import { resolveScaleToMidi } from "types/Scale/ScaleResolvers";
import { selectScaleIds, selectScaleMap } from "types/Scale/ScaleSelectors";
import { MidiValue } from "types/Scale/ScaleTypes";
import {
  selectSelectedClipType,
  selectSelectedPattern,
  selectSelectedPose,
  selectSelectedScale,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackMidiScaleMap,
  selectScaleTrackMap,
} from "types/Track/TrackSelectors";
import { Key } from "types/units";
import { getMidiPitchClass } from "utils/midi";
import { getSortedPitchClasses } from "utils/pitch";
import { selectScaleName } from "./ArrangementTrackSelectors";
import { Dictionary } from "@reduxjs/toolkit";
import { getDictValues } from "utils/objects";

/** Select the map of scales to their MIDI notes. */
export const selectMidiScaleMap = createDeepSelector(
  [
    selectTrackMidiScaleMap,
    selectScaleTrackMap,
    selectScaleMap,
    selectScaleIds,
  ],
  (trackMidiScaleMap, scaleTrackMap, scales, scaleIds) => {
    const scaleTracks = getDictValues(scaleTrackMap);
    const result = {} as Dictionary<MidiValue[]>;
    for (const scaleId of scaleIds) {
      const scale = scales[scaleId];

      // If the scale does not exist, add an empty array
      if (!scale) {
        result[scaleId] = [];
        continue;
      }

      // If the scale has a track, use the track's MIDI notes
      const scaleTrack = scaleTracks.find((track) => track.scaleId === scaleId);
      if (scaleTrack) {
        const midiScale = trackMidiScaleMap[scaleTrack.id];
        result[scaleId] = midiScale;
      }

      // Otherwise, resolve the scale to MIDI notes
      else {
        result[scaleId] = resolveScaleToMidi(scale);
      }
    }
    return result;
  }
);

/** Select the MIDI notes of a scale. */
export const selectMidiScale = createArraySelector(selectMidiScaleMap);

/** Select the map of scales to their keys. */
export const selectScaleKeyMap = createDeepSelector(
  [selectScaleMap, selectMidiScaleMap],
  (scales, midiScales) => {
    const result = {} as Dictionary<Key>;
    for (const scaleId in scales) {
      const midiScale = midiScales[scaleId];

      // If the scale does not exist, add an empty array
      if (!midiScale) {
        result[scaleId] = [];
        continue;
      }

      // Get the pitch classes of the MIDI notes
      const pitches = midiScale.map((midi) => getMidiPitchClass(midi));
      result[scaleId] = getSortedPitchClasses(pitches);
    }
    return result;
  }
);

/** Select the key of a scale. */
export const selectScaleKey = createArraySelector(selectScaleKeyMap);

/** Select the name of the currently selected motif. */
export const selectSelectedMotifName = (project: Project) => {
  const type = selectSelectedClipType(project);
  if (!type) return "No Object";
  const pattern = selectSelectedPattern(project);
  const pose = selectSelectedPose(project);
  const scale = selectSelectedScale(project);
  return {
    pattern: pattern?.name ?? "No Pattern",
    pose: pose?.name ?? "No Pose",
    scale: selectScaleName(project, scale?.id) ?? scale?.name ?? "No Scale",
  }[type];
};
