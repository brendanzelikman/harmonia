import { getValuesByKeys, getValueByKey, getArrayByKey } from "utils/objects";
import { selectScaleMap } from "../../types/Scale/ScaleSelectors";
import {
  createValueSelector,
  createValueListSelector,
  createArraySelector,
  createDeepSelector,
} from "lib/redux";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { PatternId, PatternNote } from "types/Pattern/PatternTypes";
import { SafeProject, Project } from "types/Project/ProjectTypes";
import {
  resolveScaleChainToMidi,
  resolveScaleToMidi,
} from "types/Scale/ScaleResolvers";
import {
  chromaticNotes,
  isNestedNote,
  ScaleId,
  ScaleObject,
} from "types/Scale/ScaleTypes";
import { MidiScale } from "utils/midi";
import {
  getOrderedTrackIds,
  getScaleTrackChainIds,
  getTrackAncestorIds,
  getTrackChildIds,
  getTrackDepth,
  getTrackDescendantIds,
  getTrackIndex,
  getTrackLabel,
} from "./TrackFunctions";
import { isScaleTrack, Track, TrackId, TrackMap } from "./TrackTypes";
import { selectInstrumentMap } from "types/Instrument/InstrumentSelectors";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { createSelector, Dictionary } from "@reduxjs/toolkit";
import {
  defaultPatternTrackState,
  defaultScaleTrackState,
  patternTrackAdapter,
  scaleTrackAdapter,
} from "./TrackSlice";
import { mapValues, merge } from "lodash";
import {
  PatternTrackState,
  PatternTrackMap,
  PatternTrackId,
  PatternTrack,
  isPatternTrackId,
} from "./PatternTrack/PatternTrackTypes";
import {
  ScaleTrackState,
  ScaleTrackMap,
  ScaleTrackId,
  ScaleTrack,
  isScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";
import { getTransposedScale } from "types/Scale/ScaleTransformers";

// ------------------------------------------------------------
// Pattern Track Selectors
// ------------------------------------------------------------

// Create a safe selector for the pattern track state.
export const selectPatternTrackState = (project: SafeProject) =>
  (project?.present?.patternTracks ??
    defaultPatternTrackState) as PatternTrackState;

// Use the memoized selectors from the entity adapter.
const patternTrackSelectors = patternTrackAdapter.getSelectors<Project>(
  selectPatternTrackState
);

export const selectPatternTrackMap = patternTrackSelectors.selectEntities as (
  project: Project
) => PatternTrackMap;
export const selectPatternTrackIds = patternTrackSelectors.selectIds as (
  project: Project
) => PatternTrackId[];
export const selectPatternTrackById = patternTrackSelectors.selectById as (
  project: Project,
  id: PatternTrackId
) => PatternTrack;
export const selectPatternTracks = patternTrackSelectors.selectAll;

// ------------------------------------------------------------
// Scale Track Selectors
// ------------------------------------------------------------

// Create a safe selector for the scale track state.
export const selectScaleTrackState = (project: SafeProject) =>
  (project?.present?.scaleTracks ?? defaultScaleTrackState) as ScaleTrackState;

// Use the memoized selectors from the entity adapter.
const scaleTrackSelectors = scaleTrackAdapter.getSelectors<Project>(
  selectScaleTrackState
);

export const selectScaleTrackMap = scaleTrackSelectors.selectEntities as (
  project: Project
) => ScaleTrackMap;
export const selectScaleTrackIds = scaleTrackSelectors.selectIds as (
  project: Project
) => ScaleTrackId[];
export const selectScaleTrackById = scaleTrackSelectors.selectById as (
  project: Project,
  id: ScaleTrackId
) => ScaleTrack;
export const selectScaleTracks = scaleTrackSelectors.selectAll;
export const selectScaleTracksByIds =
  createValueListSelector(selectScaleTrackMap);

// ------------------------------------------------------------
// Combined Track Selectors
// ------------------------------------------------------------

export const selectTrackMap = createDeepSelector(
  [selectPatternTrackMap, selectScaleTrackMap],
  (patternTrackMap, scaleTrackMap) =>
    merge({}, patternTrackMap, scaleTrackMap) as TrackMap
);

export const selectTrackIds = createDeepSelector(
  [selectPatternTrackIds, selectScaleTrackIds],
  (patternTrackIds, scaleTrackIds) =>
    [...patternTrackIds, ...scaleTrackIds] as TrackId[]
);

export const selectOrderedTrackIds = createDeepSelector(
  [selectTrackMap],
  (trackMap) => getOrderedTrackIds(trackMap)
);

export const selectOrderedTracks = createDeepSelector(
  [selectOrderedTrackIds, selectTrackMap],
  (trackIds, trackMap) => trackIds.map((id) => trackMap[id]) as Track[]
);

export const selectTracks = createDeepSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks) => [...scaleTracks, ...patternTracks] as Track[]
);

export const selectTrackById = createValueSelector(selectTrackMap);

export const selectLastTrack = createSelector(selectTracks, (tracks) =>
  tracks.at(-1)
);

export const selectCollapsedTrackMap = createDeepSelector(
  selectTrackMap,
  (trackMap) => mapValues(trackMap, (track) => !!track?.collapsed)
);

// ------------------------------------------------------------
// Scale Tracks
// ------------------------------------------------------------

/** Select a ScaleTrack with its scale ID. */
export const selectScaleTrackByScaleId = (
  project: Project,
  scaleId?: ScaleId
) => {
  const scaleTracks = selectScaleTracks(project);
  return scaleTracks.find((track) => track.scaleId === scaleId);
};

// ------------------------------------------------------------
// Track Ancestors
// ------------------------------------------------------------

/** Select all top level tracks. */
export const selectTopLevelTracks = createDeepSelector(
  [selectTracks],
  (tracks) => tracks.filter((track) => !track.parentId)
);

/** Select all top level track IDs. */
export const selectTopLevelTrackIds = createDeepSelector(
  [selectTopLevelTracks],
  (tracks) => tracks.map((track) => track.id)
);

/** Select the map of all tracks to their ancestor ids. */
export const selectTrackAncestorIdsMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (track) =>
      track ? getTrackAncestorIds(track.id, trackMap) : []
    )
);

/** Select the ancestor IDs of a track. */
export const selectTrackAncestorIds = createArraySelector(
  selectTrackAncestorIdsMap
);

/** Select the ancestors of a track. */
export const selectTrackAncestors = (project: Project, id?: TrackId) => {
  const ancestorIds = selectTrackAncestorIds(project, id);
  return ancestorIds.map((id) => selectTrackById(project, id));
};

// ------------------------------------------------------------
// Scale Track Chain
// ------------------------------------------------------------

/** Select the map of all tracks to their scale track chains. */
export const selectTrackChainIdsMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getScaleTrackChainIds(t.id, trackMap) : []))
);

/** Select the IDs of a track's scale track chain. */
export const selectTrackChainIds = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const chainIdsMap = selectTrackChainIdsMap(project);
  return getArrayByKey(chainIdsMap, id);
};

/** Select the scale track chain of a track. */
export const selectTrackChain = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackChainIds = selectTrackChainIds(project, id);
  return selectScaleTracksByIds(project, trackChainIds);
};

// ------------------------------------------------------------
// Track Descendants
// ------------------------------------------------------------

/** Select the map of all tracks to their descendant IDs. */
export const selectTrackDescendantIdMap = createDeepSelector(
  [selectTrackMap],
  (trackMap): Dictionary<TrackId[]> =>
    mapValues(trackMap, (track) => {
      return track ? getTrackDescendantIds(track.id, trackMap) : [];
    })
);

/** Select the map of tracks to their descendants */
export const selectTrackDescendantMap = createDeepSelector(
  [selectTrackDescendantIdMap, selectTrackMap],
  (descendantIdMap, trackMap) =>
    mapValues(trackMap, (track) => {
      const descendantIds = getArrayByKey(descendantIdMap, track?.id);
      return descendantIds.map((descendantId) => trackMap[descendantId]);
    })
);

/** Select the IDs of the descendants of a track. */
export const selectTrackDescendantIds = createArraySelector(
  selectTrackDescendantIdMap
);

/** Select the descendants of a track. */
export const selectTrackDescendants = (project: Project, id?: TrackId) => {
  const descendantIds = selectTrackDescendantIds(project, id);
  return descendantIds
    .map((id) => selectTrackById(project, id))
    .filter(Boolean) as Track[];
};

export const selectTrackParentIdMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) => mapValues(trackMap, (track) => track?.parentId)
);

/** Select the map of all tracks to their children IDs */
export const selectTrackChildIdMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (track) =>
      track ? getTrackChildIds(track.id, trackMap) : []
    )
);

/** Select the map of all tracks to their children */
export const selectTrackChildMap = createDeepSelector(
  [selectTrackChildIdMap, selectTrackMap],
  (childIdMap, trackMap): Dictionary<Track[]> =>
    mapValues(trackMap, (track) => {
      const childIds = getArrayByKey(childIdMap, track?.id);
      return getValuesByKeys(trackMap, childIds);
    })
);

export const selectTrackCollapsedMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) => mapValues(trackMap, (track) => !!track?.collapsed)
);

/** Select the children of a track. */
export const selectTrackChildren = (project: Project, id?: TrackId) => {
  const childIdMap = selectTrackChildIdMap(project);
  const childIds = getValueByKey(childIdMap, id);
  if (!childIds) return [];
  return childIds.map((id) => selectTrackById(project, id));
};

// ------------------------------------------------------------
// Track Depth, Label, and Index Selectors
// ------------------------------------------------------------

/** Select the record of all tracks and their depths. */
export const selectTrackDepthMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackDepth(t.id, trackMap) : 0))
);

/** Select the record of all tracks and their labels. */
export const selectTrackLabelMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackLabel(t.id, trackMap) : "*"))
);

/** Select the record of all tracks and their indices. */
export const selectTrackIndexMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackIndex(t.id, trackMap) : -1))
);

/** Select the depth of a track by ID. */
export const selectTrackDepthById = createValueSelector(selectTrackDepthMap, 0);

/** Select the label of a track by ID. */
export const selectTrackLabelById = createValueSelector(selectTrackLabelMap);

/** Select the index of a track by ID. */
export const selectTrackIndexById = createValueSelector(
  selectTrackIndexMap,
  -1
);

// ------------------------------------------------------------
// Track Instrument Selectors
// ------------------------------------------------------------

export const selectOrderedPatternTracks = createDeepSelector(
  [selectOrderedTrackIds, selectPatternTrackMap],
  (trackIds, trackMap) =>
    trackIds
      .filter(isPatternTrackId)
      .map((id) => trackMap[id])
      .filter(Boolean) as PatternTrack[]
);

/** Select the record of all pattern tracks to their instruments. */
export const selectTrackInstrumentMap = createDeepSelector(
  [selectPatternTrackMap, selectInstrumentMap],
  (trackMap, instrumentMap) =>
    mapValues(trackMap, (t) => getValueByKey(instrumentMap, t?.instrumentId))
);

/** Select the record of all tracks to their audio instances. */
export const selectTrackAudioInstanceMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) =>
      getValueByKey(
        LIVE_AUDIO_INSTANCES,
        (t as PatternTrack)?.instrumentId ?? "global"
      )
    )
);

/** Select the record of all instruments to their pattern tracks. */
export const selectInstrumentTrackMap = createDeepSelector(
  [selectPatternTracks, selectInstrumentMap],
  (tracks, instrumentMap) =>
    mapValues(instrumentMap, (i) =>
      i ? tracks.find((t) => t.instrumentId === i.id) : undefined
    )
);

/** Select the instrument of a track. */
export const selectTrackInstrument = (project: Project, id?: TrackId) => {
  const instrumentMap = selectTrackInstrumentMap(project);
  return getValueByKey(instrumentMap, id);
};

/** Select the instrument key of a track. */
export const selectTrackInstrumentKey = (project: Project, id?: TrackId) => {
  const instrument = selectTrackInstrument(project, id);
  return instrument?.key;
};

/** Select the instrument name of a track. */
export const selectTrackInstrumentName = (project: Project, id?: TrackId) => {
  const instrument = selectTrackInstrument(project, id);
  return getInstrumentName(instrument?.key);
};

// ------------------------------------------------------------
// Track Scale Selectors
// ------------------------------------------------------------

/** Select the map of all tracks to their scale chains. */
export const selectTrackScaleChainMap = createDeepSelector(
  [selectTrackMap, selectScaleMap],
  (trackMap, scaleMap) =>
    mapValues(trackMap, (t) => {
      if (!t) return [];
      const chainIds = getScaleTrackChainIds(t.id, trackMap);
      const chain = getValuesByKeys(trackMap, chainIds).filter(isScaleTrack);
      const scales = chain.map((track) => scaleMap[track.scaleId]);
      return scales.filter(Boolean) as ScaleObject[];
    })
);

/** Select the map of all tracks to their scales. */
export const selectTrackScaleMap = createDeepSelector(
  [selectScaleTrackMap, selectScaleMap],
  (trackMap, scaleMap) =>
    mapValues(trackMap, (t) => getArrayByKey(scaleMap, t?.scaleId))
);

/** Select the map of all tracks to their MIDI scales. */
export const selectTrackMidiScaleMap = createDeepSelector(
  [selectTrackMap, selectTrackScaleChainMap],
  (trackMap, scaleChainMap) =>
    mapValues(trackMap, (t) => {
      const scales = getArrayByKey(scaleChainMap, t?.id);
      return resolveScaleChainToMidi(scales);
    })
);

/** Select the map of scales to their MIDI scales. */
export const selectMidiScaleMap = createDeepSelector(
  [selectScaleMap, selectScaleTracks, selectTrackMidiScaleMap],
  (scaleMap, scaleTracks, midiMap) =>
    mapValues(scaleMap, (scale) => {
      if (!scale) return [];
      const track = scaleTracks.find((track) => track.scaleId === scale.id);
      return getValueByKey(midiMap, track?.id) ?? resolveScaleToMidi(scale);
    })
);

/** Select the map of all tracks to their parent MIDI scales. */
export const selectTrackParentMidiScaleMap = createDeepSelector(
  [selectTrackMap, selectTrackScaleChainMap],
  (trackMap, scaleChainMap) =>
    mapValues(trackMap, (t) => {
      if (!t) return [];
      const scales = getArrayByKey(scaleChainMap, t.parentId);
      return resolveScaleChainToMidi(scales);
    })
);

/** Select the scale chain of a specific track by ID. */
export const selectTrackScaleChain = createArraySelector(
  selectTrackScaleChainMap
);

export const selectPatternScales = (project: Project, id: PatternId) => {
  const pattern = selectPatternById(project, id);
  const map = selectTrackScaleChainMap(project);
  return getArrayByKey(map, pattern?.trackId);
};

/** Select the MIDI scale of a scale by ID. */
export const selectMidiScale = createArraySelector(selectMidiScaleMap);

/** Select the scale of a specific track by ID. */
export const selectTrackScale = (project: Project, id?: TrackId) => {
  const scaleChain = selectTrackScaleChain(project, id);
  return scaleChain.at(-1);
};

/** Select the parent scales of a specific track by ID. */
export const selectTrackParentScales = (project: Project, id?: TrackId) => {
  const scaleChain = selectTrackScaleChain(project, id);
  return scaleChain.slice(0, -1);
};

/** Select the parent MIDI scale of a specific track by ID. */
export const selectTrackParentMidiScale = createArraySelector(
  selectTrackParentMidiScaleMap
);

/** Select the scale of a track as an array of `MidiValues`. */
export const selectTrackMidiScale = createValueSelector(
  selectTrackMidiScaleMap,
  chromaticNotes
);

/** Select the tracks from the given IDs whose scales could contain the given chord.  */
export const selectTrackIdsWithPossibleScales = (
  project: Project,
  ids?: TrackId[],
  note?: PatternNote
) => {
  if (!ids || !note) return [];
  const scaleTrackMap = selectScaleTrackMap(project);
  const midiScaleMap = selectTrackMidiScaleMap(project);
  return getTrackIdsWithPossibleScales(note, ids, midiScaleMap, scaleTrackMap);
};

/** Select the tracks from the given IDs whose scales could contain the given chord.  */
export const getTrackIdsWithPossibleScales = (
  note?: PatternNote,
  trackIds?: TrackId[],
  midiScaleMap?: Dictionary<MidiScale>,
  trackMap?: Dictionary<ScaleTrack>
) => {
  if (!note || !trackIds || !midiScaleMap || !trackMap) return [];
  return trackIds.filter((id) => {
    const midiScale = midiScaleMap[id];
    const track = trackMap[id];
    if (!midiScale || !isScaleTrackId(id)) return false;

    // Return true if a nested note matches the scale ID or otherwise midi value
    return midiScale.some((scaleMidi) => {
      let midi;

      // If the note is nested, return true if the note's scale ID matches the track's scale ID
      if (isNestedNote(note)) {
        if (track?.scaleId === note.scaleId) return true;
        const scaleTrack = Object.values(trackMap).find(
          (track) => track?.scaleId === note.scaleId
        );
        const scale = scaleTrack
          ? midiScaleMap[scaleTrack.id] ?? midiScale
          : midiScale;
        midi = scale[note.degree];
      } else {
        midi = note.MIDI;
      }

      return scaleMidi % 12 === midi % 12;
    });
  });
};
