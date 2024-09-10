import { createDeepSelector, createArraySelector } from "lib/redux";
import { Project } from "types/Project/ProjectTypes";
import { resolveScaleToMidi } from "types/Scale/ScaleResolvers";
import { selectScaleIds, selectScaleMap } from "types/Scale/ScaleSelectors";
import { MidiScale } from "utils/midi";
import {
  selectTimelineType,
  selectSelectedPattern,
  selectSelectedPose,
  selectSelectedScale,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackMidiScaleMap,
  selectScaleTrackMap,
  selectTrackScaleChainMap,
} from "types/Track/TrackSelectors";
import { Key } from "types/units";
import { getMidiPitchClass } from "utils/midi";
import { getSortedPitchClasses } from "utils/pitchClass";
import {
  selectScaleName,
  selectScaleNameMap,
} from "./ArrangementTrackSelectors";
import { createSelector, Dictionary } from "@reduxjs/toolkit";
import { getArrayByKey, getDictValues } from "utils/objects";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { getPoseDuration } from "types/Pose/PoseFunctions";

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
    const result = {} as Dictionary<MidiScale>;
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
export const selectSelectedMotifName = (
  project: Project,
  type = selectTimelineType(project)
) => {
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

/** Select the duration of the currently selected motif */
export const selectSelectedMotifDuration = (
  project: Project,
  type = selectTimelineType(project)
) => {
  const pattern = selectSelectedPattern(project);
  const pose = selectSelectedPose(project);
  return {
    pattern: getPatternDuration(pattern),
    pose: getPoseDuration(pose),
    scale: 0,
  }[type];
};
/** Select the scale names of the currently selected track. */

export const selectSelectedTrackScaleNames = createSelector(
  [selectSelectedTrackId, selectTrackScaleChainMap, selectScaleNameMap],
  (id, chainMap, nameMap) => {
    const chain = getArrayByKey(chainMap, id);
    return chain.map((scale) => nameMap[scale.id]);
  }
);
