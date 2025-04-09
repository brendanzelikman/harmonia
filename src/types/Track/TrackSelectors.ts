import { getValuesByKeys, getValueByKey, getArrayByKey } from "utils/objects";
import { selectScaleMap } from "../../types/Scale/ScaleSelectors";
import {
  createValueSelector,
  createArraySelector,
  createDeepSelector,
} from "utils/redux";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { SafeProject, Project } from "types/Project/ProjectTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { chromaticNotes, ScaleId, ScaleObject } from "types/Scale/ScaleTypes";
import {
  getOrderedTrackIds,
  getScaleTrackChainIds,
  getTrackAncestorIds,
  getTrackChildIds,
  getTrackDepth,
  getTrackDescendantIds,
  getTrackIndex,
  getTrackLabel,
  getTrackOrder,
} from "./TrackFunctions";
import {
  isPatternTrack,
  isScaleTrack,
  Track,
  TrackId,
  TrackState,
} from "./TrackTypes";
import { selectInstrumentMap } from "types/Instrument/InstrumentSelectors";
import { createSelector } from "@reduxjs/toolkit";
import { defaultTrackState, trackAdapter } from "./TrackSlice";
import { mapValues, uniq } from "lodash";
import {
  PatternTrackId,
  PatternTrack,
  isPatternTrackId,
} from "./PatternTrack/PatternTrackTypes";
import {
  ScaleTrackId,
  ScaleTrack,
  isScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";
import { getScaleName } from "utils/scale";

// ------------------------------------------------------------
// Track - Base Selectors
// ------------------------------------------------------------

// Create a safe selector for the track state.
export const selectTrackState = (project: SafeProject) =>
  (project?.present?.tracks ?? defaultTrackState) as TrackState;

// Use the memoized selectors from the entity adapter.
const trackSelectors = trackAdapter.getSelectors<Project>(selectTrackState);

export const selectTrackMap = trackSelectors.selectEntities;
export const selectTrackById = trackSelectors.selectById;

/** Select the sorted list of track IDs. */
export const selectTrackIds = createSelector([selectTrackMap], (trackMap) =>
  getOrderedTrackIds(trackMap)
);

/** Select the sorted list of pattern track IDs. */
export const selectPatternTrackIds = createSelector([selectTrackIds], (ids) =>
  ids.filter(isPatternTrackId)
);

/** Select the sorted list of scale track IDs. */
export const selectScaleTrackIds = createSelector([selectTrackIds], (ids) =>
  ids.filter(isScaleTrackId)
);

/** Select the sorted list of tracks. */
export const selectTracks = createDeepSelector(
  [selectTrackIds, selectTrackMap],
  (trackIds, trackMap) => trackIds.map((id) => trackMap[id]) as Track[]
);

/** Select the sorted list of pattern tracks. */
export const selectPatternTracks = createDeepSelector(
  [selectPatternTrackIds, selectTrackMap],
  (ids, trackMap) => ids.map((id) => trackMap[id]) as PatternTrack[]
);

/** Select the sorted list of scale tracks. */
export const selectScaleTracks = createDeepSelector(
  [selectScaleTrackIds, selectTrackMap],
  (ids, trackMap) => ids.map((id) => trackMap[id]) as ScaleTrack[]
);

/** Select a pattern track by ID. */
export const selectPatternTrackById = (project: Project, id: PatternTrackId) =>
  selectTrackById(project, id) as PatternTrack;

/** Select a scale track by ID. */
export const selectScaleTrackById = (project: Project, id: ScaleTrackId) =>
  selectTrackById(project, id) as ScaleTrack;

/** Select all top level tracks. */
export const selectTopLevelTracks = createDeepSelector(
  [selectTracks],
  (tracks) => tracks.filter((track) => !track.parentId)
);

export const selectCollapsedTrackMap = createDeepSelector(
  selectTrackMap,
  (trackMap) => mapValues(trackMap, (track) => !!track?.collapsed)
);

// ------------------------------------------------------------
// Track - Ancestors and Descendants
// ------------------------------------------------------------

/** Select the map of all tracks to their ancestor ids. */
export const selectTrackAncestorIdsMap = createDeepSelector(
  [selectTrackIds, selectTrackMap],
  (trackIds, trackMap) =>
    trackIds.reduce(
      (map, id) => ({ ...map, [id]: getTrackAncestorIds(id, trackMap) }),
      {} as Record<TrackId, TrackId[]>
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

/** Select the map of all tracks to their descendant IDs. */
export const selectTrackDescendantIdMap = createDeepSelector(
  [selectTrackMap],
  (trackMap): Record<TrackId, TrackId[]> =>
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

/** Select the map of all tracks to their parent IDs */
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

/** Select the parent of a track. */
export const selectTrackParent = (project: Project, id?: TrackId) => {
  const parentIdMap = selectTrackParentIdMap(project);
  const parentId = getValueByKey(parentIdMap, id);
  if (!parentId) return;
  return selectTrackById(project, parentId);
};

/** Select the children of a track. */
export const selectTrackChildren = (project: Project, id?: TrackId) => {
  const childIdMap = selectTrackChildIdMap(project);
  const childIds = getValueByKey(childIdMap, id);
  if (!childIds) return [];
  return childIds
    .map((id) => selectTrackById(project, id))
    .filter(Boolean) as Track[];
};

/** Select the child IDs of a track. */
export const selectTrackChildIds = createArraySelector(selectTrackChildIdMap);

// ------------------------------------------------------------
// Track - Depth, Label, Order, and Index
// ------------------------------------------------------------

/** Select the record of all tracks and their depths. */
export const selectTrackDepthMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackDepth(t.id, trackMap) : 0))
);

/** Select the depth of a track by ID. */
export const selectTrackDepthById = createValueSelector(selectTrackDepthMap, 0);

/** Select the record of all tracks and their labels. */
export const selectTrackLabelMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackLabel(t.id, trackMap) : "*"))
);

/** Select the label of a track by ID. */
export const selectTrackLabelById = createValueSelector(
  selectTrackLabelMap,
  "*"
);

/** Select the record of all tracks and their orders. */
export const selectTrackOrderMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackOrder(t.id, trackMap) : "*"))
);

/** Select the order of a track by ID. */
export const selectTrackOrderById = createValueSelector(
  selectTrackOrderMap,
  "0"
);

/** Select the record of all tracks and their indices. */
export const selectTrackIndexMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getTrackIndex(t.id, trackMap) : -1))
);

/** Select the index of a track by ID. */
export const selectTrackIndexById = createValueSelector(
  selectTrackIndexMap,
  -1
);

/** Select the map of all labels to their tracks */
export const selectLabelTrackMap = createDeepSelector(
  [selectTrackIds, selectTrackMap, selectTrackLabelMap],
  (trackIds, trackMap, labelMap) =>
    trackIds.reduce((map, id) => {
      const track = trackMap[id];
      if (!track) return map;
      return { ...map, [labelMap[id]]: track };
    }, {} as Record<string, Track>)
);

/** Select a track by its label. */
export const selectTrackByLabel = createValueSelector(selectLabelTrackMap);

// ------------------------------------------------------------
// Track - Instruments and Audio Instances
// ------------------------------------------------------------

/** Select the record of all pattern tracks to their instruments. */
export const selectTrackInstrumentMap = createDeepSelector(
  [selectTrackMap, selectInstrumentMap],
  (trackMap, instrumentMap) =>
    mapValues(trackMap, (t) =>
      getValueByKey(
        instrumentMap,
        isPatternTrack(t) ? t.instrumentId : undefined
      )
    )
);

/** Select the instrument of a track. */
export const selectTrackInstrument = createValueSelector(
  selectTrackInstrumentMap
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

/** Select all tracks that use an instrument key. */
export const selectTracksByInstrumentKey = (
  project: Project,
  key: string
): Track[] => {
  const trackMap = selectTrackMap(project);
  const instrumentMap = selectTrackInstrumentMap(project);
  const tracks = Object.values(trackMap).filter(
    (track) => track && instrumentMap[track.id]?.key === key
  );
  return tracks as Track[];
};

// ------------------------------------------------------------
// Track - Scales and Chains
// ------------------------------------------------------------

export const selectScaleToTrackMap = createDeepSelector(
  [selectScaleMap, selectTracks],
  (scaleMap, tracks) => {
    return mapValues(scaleMap, (scale) => {
      const track = tracks.find((t) => t.scaleId === scale?.id);
      if (track) return track;
      return undefined;
    });
  }
);

/** Select a scale track using its scale ID. */
export const selectScaleTrackByScaleId = (
  project: Project,
  scaleId?: ScaleId
) => {
  const scaleTracks = selectScaleTracks(project);
  return scaleTracks.find((track) => track.scaleId === scaleId);
};

/** Select the map of all tracks to their scale track chains. */
export const selectScaleTrackChainIdsMap = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    mapValues(trackMap, (t) => (t ? getScaleTrackChainIds(t.id, trackMap) : []))
);

/** Select the IDs of a track's scale track chain. */
export const selectScaleTrackChainIds = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const chainIdsMap = selectScaleTrackChainIdsMap(project);
  return getArrayByKey(chainIdsMap, id);
};

/** Select the scale track chain of a track. */
export const selectScaleTrackChain = (project: Project, id?: TrackId) => {
  if (!id) return [];
  const trackChainIds = selectScaleTrackChainIds(project, id);
  return trackChainIds.map((id) => selectScaleTrackById(project, id));
};

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

/** Select the scale chain of a track by ID. */
export const selectTrackScaleChain = createArraySelector(
  selectTrackScaleChainMap
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

/** Select the scale of a track as an array of `MidiValues`. */
export const selectTrackMidiScale = createValueSelector(
  selectTrackMidiScaleMap,
  chromaticNotes
);

/** Select the scale of a specific track by ID. */
export const selectTrackScale = (project: Project, id?: TrackId) => {
  const scaleChain = selectTrackScaleChain(project, id);
  return scaleChain.at(-1);
};

/** Select whether the timeline is available. */
export const selectHasTracks = createDeepSelector(
  [selectTrackIds],
  (ids) => !!ids.length
);

/** Select the unique scale names of the project. */
export const selectUniqueScaleNames = createSelector(
  [selectTrackMidiScaleMap],
  (scaleMap) => {
    const scales = Object.values(scaleMap);
    const names = scales.map(getScaleName);
    return uniq(names).join(", ");
  }
);
