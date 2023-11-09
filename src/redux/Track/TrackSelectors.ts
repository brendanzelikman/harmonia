import { Project } from "types/Project";
import { createSelector } from "reselect";
import { Tick } from "types/units";
import { getValuesByKeys, getValueByKey } from "utils/objects";
import {
  Track,
  TrackId,
  TrackMap,
  getScaleTrackChain,
  getScaleTrackIdChain,
  getTrackParents,
} from "types/Track";
import { isScaleTrack } from "types/ScaleTrack";
import {
  getCurrentTransposition,
  getTranspositionOffsetById,
} from "types/Transposition";
import {
  getTrackChildIds,
  getTrackTranspositionIds,
} from "types/TrackHierarchy";
import {
  selectScaleTracks,
  selectScaleTrackMap,
  selectScaleTrackById,
} from "../ScaleTrack/ScaleTrackSelectors";
import {
  selectPatternTracks,
  selectPatternTrackMap,
  selectPatternTrackById,
} from "../PatternTrack/PatternTrackSelectors";
import { selectTranspositionMap } from "../Transposition/TranspositionSelectors";
import {
  selectOrderedTrackIds,
  selectTrackHierarchy,
  selectTrackNodeMap,
} from "../TrackHierarchy";
import {
  getFullyTransposedScale,
  chromaticScale,
  getTransposedScale,
  MidiValue,
  chromaticNotes,
  resolveScaleChainToMidi,
  isNestedNote,
  getScaleName,
  areScalesRelated,
  getScaleNoteAsPitchClass,
} from "types/Scale";
import { selectScaleMap } from "../Scale/ScaleSelectors";
import { numberToLower } from "utils/math";
import {
  Pattern,
  PatternMidiStream,
  PatternNote,
  getMidiStreamScale,
} from "types/Pattern";
import {
  BasicIntervals,
  BasicChords,
  SeventhChords,
  ExtendedChords,
  FamousChords,
} from "presets/patterns";

// ------------------------------------------------------------
// Track Selectors
// ------------------------------------------------------------

/** Select the track map. */
export const selectTrackMap = createSelector(
  [selectScaleTrackMap, selectPatternTrackMap],
  (scaleTrackMap, patternTrackMap): TrackMap => ({
    ...scaleTrackMap,
    ...patternTrackMap,
  })
);

/** Select all tracks. */
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks): Track[] => [...scaleTracks, ...patternTracks]
);

/** Select a track by ID or return undefined if not found. */
export const selectTrackById = (project: Project, id?: TrackId) => {
  const trackMap = selectTrackMap(project);
  return getValueByKey(trackMap, id);
};

/** Select a list of tracks by ID. */
export const selectTracksByIds = (project: Project, ids: TrackId[]) => {
  const trackMap = selectTrackMap(project);
  return getValuesByKeys(trackMap, ids);
};

/** Select the chained ancestors of a track. */
export const selectTrackChain = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackMap = selectTrackMap(project);
  return getScaleTrackChain(id, trackMap);
};

/** Select the IDs of the chained ancestors of a track. */
export const selectTrackIdChain = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackMap = selectTrackMap(project);
  return getScaleTrackIdChain(id, trackMap);
};

/** Select the parents of a track. */
export const selectTrackParents = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackMap = selectTrackMap(project);
  return getTrackParents(id, trackMap);
};

/** Select the children of a track. */
export const selectTrackChildren = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackNodeMap = selectTrackNodeMap(project);
  const childIds = getTrackChildIds(id, trackNodeMap);
  return selectTracksByIds(project, childIds);
};

/** Select a record of tracks and their labels. */
export const selectTrackLabelMap = (project: Project) => {
  const trackIds = selectOrderedTrackIds(project);
  return trackIds.reduce((acc, id) => {
    // Return just the index if the track is in the top level
    const trackIndex = selectTrackIndexById(project, id) + 1;
    const hierarchy = selectTrackHierarchy(project);
    if (hierarchy.topLevelIds.includes(id))
      return { ...acc, [id]: `${trackIndex}` };

    // Otherwise, use all track parents to get the label
    const parents = selectTrackChain(project, id);
    const patternTrack = selectPatternTrackById(project, id);
    const tracks = !!patternTrack ? [...parents, patternTrack] : parents;
    const root = tracks[0];
    const rest = tracks.slice(1);

    // Get the index of the root and the letters of the rest
    const rootIndex = hierarchy.topLevelIds.indexOf(root.id) + 1;
    const restLetters = rest.map((track) => {
      const index = selectTrackIndexById(project, track.id);
      return numberToLower(index);
    });

    // Return the label
    return { ...acc, [id]: `${rootIndex}${restLetters.join("")}` };
  }, {} as Record<TrackId, string>);
};

// ------------------------------------------------------------
// Property Selectors
// ------------------------------------------------------------

/** Select the index of a track by ID. */
export const selectTrackIndexById = (project: Project, id?: TrackId) => {
  if (!id) return -1;
  const hierarchy = selectTrackHierarchy(project);
  const track = selectTrackById(project, id);
  if (!track) return -1;

  // If the track is a scale track, try to find it in the top level
  if (isScaleTrack(track)) {
    const topLevelIndex = hierarchy.topLevelIds.indexOf(track.id);
    if (topLevelIndex > -1) return topLevelIndex;
  }

  // Otherwise, return the index of the track in its parent
  const parent = getValueByKey(hierarchy.byId, track.parentId);
  return parent ? parent.trackIds.indexOf(track.id) : -1;
};

/** Select the label of a track by ID. */
export const selectTrackLabelById = (project: Project, id?: TrackId) => {
  if (!id) return undefined;
  const labels = selectTrackLabelMap(project);
  return labels[id];
};

// ------------------------------------------------------------
// Transposition Selectors
// ------------------------------------------------------------

/** Select the transpositions of a track by ID. */
export const selectTrackTranspositions = (project: Project, id: TrackId) => {
  const transpositionMap = selectTranspositionMap(project);
  const trackNodeMap = selectTrackNodeMap(project);
  const ids = getTrackTranspositionIds(id, trackNodeMap);
  return getValuesByKeys(transpositionMap, ids);
};

/** Selects the transpositions of the parent of a track. */
export const selectTrackParentTranspositions = (
  project: Project,
  id: TrackId
) => {
  const trackMap = selectTrackMap(project);
  const transpositionMap = selectTranspositionMap(project);
  const trackNodeMap = selectTrackNodeMap(project);
  const parents = getScaleTrackIdChain(id, trackMap);
  return parents.map((parent) => {
    const ids = getTrackTranspositionIds(parent, trackNodeMap);
    return getValuesByKeys(transpositionMap, ids);
  });
};

/** Select the scale track of a track by ID. */
export const selectTrackScaleTrack = (project: Project, id?: TrackId) => {
  const track = selectTrackById(project, id);
  if (!track) return undefined;
  if (isScaleTrack(track)) return track;
  if (!track.parentId) return undefined;
  return selectScaleTrackById(project, track.parentId);
};

// ------------------------------------------------------------
// Scale Selectors
// ------------------------------------------------------------

/** Select the scale chain of a specific track by ID. */
export const selectTrackScaleChain = (project: Project, id?: TrackId) => {
  const scaleMap = selectScaleMap(project);
  const trackChain = selectTrackChain(project, id);
  return trackChain.map((track) => scaleMap[track.scaleId]);
};

/** Select the scale of a specific track by ID. */
export const selectTrackScale = (project: Project, id?: TrackId) => {
  const scaleChain = selectTrackScaleChain(project, id);
  return scaleChain.at(-1);
};

/** Select the map of all tracks to their scales. */
export const selectTrackScaleMap = (project: Project) => {
  const scaleMap = selectScaleMap(project);
  const trackMap = selectTrackMap(project);
  return Object.fromEntries(
    Object.entries(trackMap).map(([id]) => [
      id,
      scaleMap[selectTrackScaleTrack(project, id)?.scaleId ?? -1],
    ])
  );
};

/** Select the tracks from the given IDs whose scales could contain the given chord.  */
export const selectTrackIdsMatchingNote = (
  project: Project,
  ids: TrackId[],
  note?: PatternNote
) => {
  if (!note) return [];
  const scaleMap = selectScaleMap(project);
  const trackMap = selectScaleTrackMap(project);
  const midiScaleMap = selectTrackMidiScaleMap(project);
  return ids.filter((id) => {
    const midiScale = midiScaleMap[id];
    // Return true if a nested note matches the scale ID or otherwise midi value
    return midiScale.some((scaleMidi) => {
      let midi;

      // If the note is nested, return true if the note's scale ID matches
      if (isNestedNote(note)) {
        if (trackMap[id]?.scaleId === note.scaleId) return true;
        const trackId = Object.keys(trackMap).find(
          (key) => trackMap[key]?.scaleId === note.scaleId
        );
        const scale = trackId ? midiScaleMap[trackId] : midiScale;
        midi = scale[note.degree];
      } else {
        midi = note.MIDI;
      }

      return scaleMidi % 12 === midi % 12;
    });
  });
};

/** Select the scale chain of a specific track at a given tick.  */
export const selectTrackScaleChainAtTick = (
  project: Project,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const scaleMap = selectScaleMap(project);
  const chain = selectTrackChain(project, trackId);
  const poses = chain.map((t) => selectTrackTranspositions(project, t.id));
  if (!chain.length) return [];

  const newChain = [];

  // Iterate down child scale tracks and apply transpositions if they exist
  for (let i = 0; i < chain.length; i++) {
    const track = chain[i];
    const scale = scaleMap[track.scaleId];

    // Try to get the transposition at the current tick
    const pose = getCurrentTransposition(poses[i], tick, false);
    if (pose === undefined) {
      newChain.push(scale);
      continue;
    }

    // Transpose the scale by each offset
    let newScale = scale;
    const offsetKeys = Object.keys(pose.vector);

    for (const id of offsetKeys) {
      if (id === "chromatic" || id === "chordal") continue;
      const scalar = getTranspositionOffsetById(pose.vector, id);
      const parentScale = i ? scaleMap[chain[i - 1].scaleId] : undefined;
      newScale = getTransposedScale(newScale, scalar, parentScale);
    }

    // Push the transposed scale
    newChain.push(newScale);
  }

  // Return the transposed tracks
  return newChain;
};

/** Select the scale of a track at a given tick (applying chromatic/chordal transpositions). */
export const selectTrackScaleAtTick = (
  project: Project,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  if (!scaleChain.length) return chromaticScale;
  const scale = scaleChain.at(-1);
  const poses = selectTrackTranspositions(project, trackId);
  const pose = getCurrentTransposition(poses, tick, false);
  return getFullyTransposedScale(scale, pose);
};

/** Select the name of a track at a given tick. */
export const selectTrackScaleNameAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  if (!trackId) return "Custom Scale";
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  const scale = selectTrackScaleAtTick(project, trackId, tick);
  if (!scaleChain.length || !scale) return "Custom Scale";
  const fullChain = [...scaleChain.slice(0, -1), scale];
  const midiScale = resolveScaleChainToMidi(fullChain).map((_) => _ % 12);
  const scaleName = getScaleName(midiScale);

  // If the scale returns as custom, try to match the MIDI with a preset pattern
  if (scaleName === "Custom Scale") {
    const presetPatterns = [
      ...Object.values(BasicIntervals.default),
      ...Object.values(BasicChords.default),
      ...Object.values(SeventhChords.default),
      ...Object.values(ExtendedChords.default),
      ...Object.values(FamousChords.default),
    ];
    const presetMatch = presetPatterns.find((preset) => {
      const scaleStream = getMidiStreamScale(
        preset.stream as PatternMidiStream
      );
      return areScalesRelated(scaleStream, midiScale);
    });
    if (presetMatch) {
      const firstPitch = getScaleNoteAsPitchClass(midiScale[0]);
      return `${firstPitch} ${presetMatch.name}`;
    }
  }

  // Otherwise, return the scale name
  return scaleName;
};

/** Select the scale of a track as an array of `MidiValues`. */
export const selectTrackMidiScale = (
  project: Project,
  id?: TrackId
): MidiValue[] => {
  // Get the scale track
  const scaleTrackMap = selectScaleTrackMap(project);
  const scaleTrack = getValueByKey(scaleTrackMap, id);
  if (!id || !scaleTrack) return [];

  // Get the scales of the scale track and its parents
  const scaleMap = selectScaleMap(project);
  const parents = getScaleTrackChain(id, scaleTrackMap);
  const scales = parents.map((parent) => scaleMap[parent.scaleId]);
  if (scales.some((scale) => !scale)) return chromaticNotes;

  // Chain the scale through its parents
  return resolveScaleChainToMidi(scales);
};

/** Select the map of all tracks to their midi scales. */
export const selectTrackMidiScaleMap = (project: Project) => {
  const scaleTrackMap = selectScaleTrackMap(project);
  return Object.fromEntries(
    Object.entries(scaleTrackMap).map(([id, scaleTrack]) => [
      id,
      selectTrackMidiScale(project, scaleTrack.id),
    ])
  );
};
