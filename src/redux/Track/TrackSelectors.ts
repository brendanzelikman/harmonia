import * as _ from "types/Track";
import * as Scale from "types/Scale";
import { Project } from "types/Project";
import { createSelector } from "reselect";
import { Tick } from "types/units";
import {
  getValuesByKeys,
  getValueByKey,
  createMap,
  createMapWithFn,
  getArrayByKey,
} from "utils/objects";
import { selectPoseMap } from "../Pose/PoseSelectors";
import { selectScaleMap } from "../Scale/ScaleSelectors";
import { PatternNote } from "types/Pattern";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { TrackId } from "types/Track";
import { selectInstrumentMap } from "redux/Instrument";
import {
  createArraySelector,
  createDeepEqualSelector,
  createTransformedArraySelector,
  createValueListSelector,
  createValueSelector,
} from "redux/util";
import { getTrackScaleChain } from "types/Arrangement";
import { selectTrackArrangement } from "redux/selectors";

// ------------------------------------------------------------
// General Tracks
// ------------------------------------------------------------

/** Select the track map. */
export const selectTrackMap = (project: Project): _.TrackMap =>
  project.arrangement.present.tracks.byId;

/** Select the unordered list of track IDs. */
export const selectTrackIds = createSelector(
  [selectTrackMap],
  _.getOrderedTrackIds
);

/** Select all tracks. */
export const selectTracks = createDeepEqualSelector(
  [selectTrackMap, selectTrackIds],
  getValuesByKeys
);

/** Select a track by ID or return undefined if not found. */
export const selectTrackById = (project: Project, id?: _.TrackId) => {
  const trackMap = selectTrackMap(project);
  return getValueByKey(trackMap, id);
};

/** Select a list of tracks by ID. */
export const selectTracksByIds = (project: Project, ids: _.TrackId[]) => {
  const trackMap = selectTrackMap(project);
  return getValuesByKeys(trackMap, ids);
};

// ------------------------------------------------------------
// Scale Tracks
// ------------------------------------------------------------

/** Select all scale tracks. */
export const selectScaleTracks = createDeepEqualSelector([selectTracks], (t) =>
  t.filter(_.isScaleTrack)
);

/** Select all scale track IDs. */
export const selectScaleTrackIds = createDeepEqualSelector(
  [selectScaleTracks],
  (tracks) => tracks.map((track) => track.id)
);

/** Select the scale track map. */
export const selectScaleTrackMap = createDeepEqualSelector(
  [selectScaleTracks],
  createMap
);

/** Select a scale track by ID or return undefined if not found. */
export const selectScaleTrackById = createValueSelector(selectScaleTrackMap);

/** Select a list of scale tracks by ID. */
export const selectScaleTracksByIds =
  createValueListSelector(selectScaleTrackMap);

/** Select a ScaleTrack with its scale ID. */
export const selectScaleTrackByScaleId = (
  project: Project,
  scaleId?: Scale.ScaleId
) => {
  const scaleTracks = selectScaleTracks(project);
  return scaleTracks.find((track) => track.scaleId === scaleId);
};

// ------------------------------------------------------------
// Pattern Tracks
// ------------------------------------------------------------

/** Select all pattern tracks. */
export const selectPatternTracks = createDeepEqualSelector(
  [selectTracks],
  (tracks) => tracks.filter(_.isPatternTrack)
);

/** Select the pattern track map. */
export const selectPatternTrackMap = createDeepEqualSelector(
  [selectPatternTracks],
  createMap
);

/** Select a pattern track by ID or return undefined if not found. */
export const selectPatternTrackById = createValueSelector(
  selectPatternTrackMap
);

/** Select a list of pattern tracks by ID. */
export const selectPatternTracksByIds = createValueListSelector(
  selectPatternTrackMap
);

// ------------------------------------------------------------
// Track Ancestors
// ------------------------------------------------------------

/** Select all top level tracks. */
export const selectTopLevelTracks = createDeepEqualSelector(
  [selectTracks],
  (tracks) => tracks.filter((track) => !track.parentId)
);

/** Select the map of all tracks to their ancestor ids. */
export const selectTrackAncestorIdsMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getTrackAncestorIds(t.id, trackMap))
);

/** Select the ancestor IDs of a track. */
export const selectTrackAncestorIds = createArraySelector(
  selectTrackAncestorIdsMap
);

// ------------------------------------------------------------
// Scale Track Chain
// ------------------------------------------------------------

/** Select the map of all tracks to their scale track chains. */
export const selectScaleTrackChainIdsMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getScaleTrackChainIds(t.id, trackMap))
);

/** Select the IDs of a track's scale track chain. */
export const selectScaleTrackChainIds = createArraySelector(
  selectScaleTrackChainIdsMap
);

/** Select the scale track chain of a track. */
export const selectScaleTrackChain = createTransformedArraySelector(
  selectScaleTrackChainIdsMap,
  selectScaleTracksByIds
);

// ------------------------------------------------------------
// Track Descendants
// ------------------------------------------------------------

/** Select the map of all tracks to their descendants. */
export const selectTrackDescendantIdsMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getTrackDescendantIds(t.id, trackMap))
);

/** Select the IDs of the descendants of a track. */
export const selectTrackDescendantIds = createArraySelector(
  selectTrackDescendantIdsMap
);

/** Select the descendants of a track. */
export const selectTrackDescendants = createTransformedArraySelector(
  selectTrackDescendantIdsMap,
  selectTracksByIds
);

/** Select the children of a track. */
export const selectTrackChildren = (project: Project, id?: _.TrackId) => {
  const tracks = selectTracks(project);
  return tracks.filter((track) => track.parentId === id);
};

// ------------------------------------------------------------
// Track Depth, Label, and Index Selectors
// ------------------------------------------------------------

/** Select the record of all tracks and their depths. */
export const selectTrackDepthMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getTrackDepth(t.id, trackMap))
);

/** Select the record of all tracks and their labels. */
export const selectTrackLabelMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getTrackLabel(t.id, trackMap))
);

/** Select the record of all tracks and their indices. */
export const selectTrackIndexMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) => _.getTrackIndex(t.id, trackMap))
);

/** Select the depth of a track by ID. */
export const selectTrackDepthById = createValueSelector(selectTrackDepthMap, 0);

/** Select the label of a track by ID. */
export const selectTrackLabelById = createValueSelector(
  selectTrackLabelMap,
  "*"
);

/** Select the index of a track by ID. */
export const selectTrackIndexById = createValueSelector(
  selectTrackIndexMap,
  -1
);

// ------------------------------------------------------------
// Track Instrument Selectors
// ------------------------------------------------------------

/** Select the record of all pattern tracks to their instruments. */
export const selectTrackInstrumentMap = createSelector(
  [selectPatternTrackMap, selectInstrumentMap],
  (trackMap, instrumentMap) =>
    createMapWithFn(trackMap, (t) => instrumentMap[t.instrumentId])
);

/** Select the record of all tracks to their audio instances. */
export const selectTrackAudioInstanceMap = createSelector(
  [selectTrackMap],
  (trackMap) =>
    createMapWithFn(trackMap, (t) =>
      getValueByKey(
        LIVE_AUDIO_INSTANCES,
        (t as _.PatternTrack).instrumentId ?? "global"
      )
    )
);

/** Select the record of all pattern tracks to their instruments. */
export const selectInstrumentTrackMap = createSelector(
  [selectPatternTracks, selectInstrumentMap],
  (tracks, instrumentMap) =>
    createMapWithFn(instrumentMap, (i) =>
      tracks.find((t) => t.instrumentId === i.id)
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

// ------------------------------------------------------------
// Track Scale Selectors
// ------------------------------------------------------------

/** Select the map of all tracks to their scale chains. */
export const selectTrackScaleChainMap = createDeepEqualSelector(
  [selectTrackMap, selectScaleMap],
  (trackMap, scaleMap) =>
    createMapWithFn(trackMap, (t) => {
      const chainIds = _.getScaleTrackChainIds(t.id, trackMap);
      const chain = getValuesByKeys(trackMap, chainIds).filter(_.isScaleTrack);
      return chain.map((track) => scaleMap[track.scaleId]);
    })
);

/** Select the map of all tracks to their scales. */
export const selectTrackScaleMap = createDeepEqualSelector(
  [selectScaleTrackMap, selectScaleMap],
  (trackMap, scaleMap) => createMapWithFn(trackMap, (t) => scaleMap[t.scaleId])
);

/** Select the map of all tracks to their MIDI scales. */
export const selectTrackMidiScaleMap = createDeepEqualSelector(
  [selectTrackMap, selectTrackScaleChainMap],
  (trackMap, scaleChainMap) =>
    createMapWithFn(trackMap, (t) => {
      const scales = getArrayByKey(scaleChainMap, t.id);
      return Scale.resolveScaleChainToMidi(scales);
    })
);

/** Select the scale chain of a specific track by ID. */
export const selectTrackScaleChain = createArraySelector(
  selectTrackScaleChainMap
);

/** Select the scale of a specific track by ID. */
export const selectTrackScale = (project: Project, id?: _.TrackId) => {
  const scaleChain = selectTrackScaleChain(project, id);
  return scaleChain.at(-1);
};

/** Select the scale of a track as an array of `MidiValues`. */
export const selectTrackMidiScale = createArraySelector(
  selectTrackMidiScaleMap
);

/** Select the tracks from the given IDs whose scales could contain the given chord.  */
export const selectTrackIdsWithPossibleScales = (
  project: Project,
  ids: _.TrackId[],
  note?: PatternNote
) => {
  if (!note) return [];
  const trackMap = selectTrackMap(project);
  const scaleTracks = selectScaleTracks(project);
  const midiScaleMap = selectTrackMidiScaleMap(project);
  return ids.filter((id) => {
    const midiScale = midiScaleMap[id];
    const track = trackMap[id];
    if (!midiScale || !_.isScaleTrack(track)) return false;

    // Return true if a nested note matches the scale ID or otherwise midi value
    return midiScale.some((scaleMidi) => {
      let midi;

      // If the note is nested, return true if the note's scale ID matches the track's scale ID
      if (Scale.isNestedNote(note)) {
        if (track?.scaleId === note.scaleId) return true;
        const scaleTrack = scaleTracks.find(
          (track) => track?.scaleId === note.scaleId
        );
        const scale = scaleTrack ? midiScaleMap[scaleTrack.id] : midiScale;
        midi = scale[note.degree];
      } else {
        midi = note.MIDI;
      }

      return scaleMidi % 12 === midi % 12;
    });
  });
};

// ------------------------------------------------------------
// Track Tick-Based Scale Selectors
// ------------------------------------------------------------

/** Select the scale chain of a specific track at a given tick.  */
export const selectTrackScaleChainAtTick = (
  project: Project,
  trackId: _.TrackId,
  tick: Tick = 0
) => {
  const scales = selectScaleMap(project);
  const poses = selectPoseMap(project);
  const arrangement = selectTrackArrangement(project);
  return getTrackScaleChain(trackId, { ...arrangement, scales, poses, tick });
};

/** Select the scale of a track at a given tick (applying chromatic/chordal poses). */
export const selectTrackScaleAtTick = (
  project: Project,
  trackId: _.TrackId,
  tick: Tick = 0
) => {
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  return scaleChain.at(-1) || Scale.chromaticScale;
};

/** Select the name of a track at a given tick. */
export const selectTrackScaleNameAtTick = (
  project: Project,
  trackId?: _.TrackId,
  tick: Tick = 0
) => {
  if (!trackId) return "Custom Scale";
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  const midiScale = Scale.resolveScaleChainToMidi(scaleChain);
  return Scale.getScaleName(midiScale, midiScale);
};
