import { Thunk } from "types/Project";
import { TrackId } from "types/Track";
import { InstrumentKey, initializeInstrument } from "types/Instrument";
import {
  PatternTrack,
  initializePatternTrack,
  isPatternTrack,
} from "types/PatternTrack";
import { isScaleTrack } from "types/ScaleTrack";
import {
  selectPatternTrackById,
  selectPatternTrackInstrument,
} from "redux/PatternTrack";
import { addPatternTrack, updatePatternTrack } from "./PatternTrackSlice";
import {
  createInstrument,
  selectInstrumentById,
  updateInstrument,
} from "redux/Instrument";
import {
  addPatternTrackToHierarchy,
  migrateTrackInHierarchy,
  moveTrackInHierarchy,
  selectTrackNodeMap,
} from "redux/TrackHierarchy";
import { selectScaleTrackById } from "redux/ScaleTrack";
import { selectTrackById, selectSelectedTrack } from "redux/selectors";

/**
 * Create a `PatternTrack` with an optional initial track.
 * @param initialTrack - The initial track to create.
 * @returns A Promise that resolves with the ID of the created track.
 */
export const createPatternTrack =
  (initialTrack?: Partial<PatternTrack>): Thunk<TrackId> =>
  (dispatch, getProject) => {
    const project = getProject();

    // Initialize a new pattern track and instrument
    const instrument = initializeInstrument();
    const patternTrack = initializePatternTrack({
      ...initialTrack,
      instrumentId: instrument.id,
    });

    // Create the pattern track
    dispatch(addPatternTrack(patternTrack));
    dispatch(addPatternTrackToHierarchy(patternTrack));

    // Create an instrument for the track or use the old one
    const oldInstrument = initialTrack?.instrumentId
      ? selectInstrumentById(project, initialTrack.instrumentId)
      : undefined;
    dispatch(createInstrument(patternTrack, { oldInstrument }));

    // Return ID of the created track
    return patternTrack.id;
  };

/** Create a `PatternTrack` using the selected track as a parent. */
export const createPatternTrackFromSelectedTrack =
  (): Thunk<TrackId | undefined> => (dispatch, getProject) => {
    const project = getProject();
    const parent = selectSelectedTrack(project);
    if (!parent) return undefined;
    const parentId = isScaleTrack(parent) ? parent.id : parent.parentId;
    return dispatch(createPatternTrack({ parentId }));
  };

/**
 * Set the `ScaleTrack` of a `PatternTrack` with an optional index.
 * @param patternTrackId - The ID of the PatternTrack to update.
 * @param parentId - The ID of the ScaleTrack to set.
 * @param index - The index to add the PatternTrack to.
 */
export const setPatternTrackScaleTrack =
  (patternTrackId: TrackId, parentId: TrackId, index?: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the pattern track
    const patternTrack = selectPatternTrackById(project, patternTrackId);
    if (!patternTrack) return;

    // Update the pattern track with the new parent
    const newTrack = { ...patternTrack, parentId };
    dispatch(updatePatternTrack(newTrack));
    dispatch(
      migrateTrackInHierarchy({
        id: patternTrackId,
        parentId,
        index,
      })
    );
  };

/**
 * Set the instrument of a `PatternTrack`.
 * @param id - The ID of the PatternTrack to update.
 * @param instrument - The instrument to set.
 */
export const setPatternTrackInstrument =
  (id?: TrackId, key?: InstrumentKey): Thunk =>
  (dispatch, getProject) => {
    if (!id || !key) return;
    const project = getProject();

    // Get the instrument
    const instrument = selectPatternTrackInstrument(project, id);
    if (!instrument) return;

    // Update the instrument with the new instrument
    dispatch(
      updateInstrument({
        id: instrument.id,
        update: { key },
      })
    );
  };

/**
 * Move a pattern track to the index of the given track ID.
 * @param props The drag and hover IDs.
 */
export const movePatternTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): Thunk<boolean> =>
  (dispatch, getProject) => {
    const { dragId, hoverId } = props;
    const project = getProject();
    const trackNodeMap = selectTrackNodeMap(project);

    // Get the corresponding pattern tracks
    const thisTrack = selectTrackById(project, dragId);
    const otherTrack = selectTrackById(project, hoverId);
    if (!thisTrack || !otherTrack) return false;

    const otherTrackParent = otherTrack.parentId
      ? trackNodeMap[otherTrack.parentId]
      : null;

    const isThisPattern = isPatternTrack(thisTrack);
    const isOtherPattern = isPatternTrack(otherTrack);

    // If this = scale track and other = pattern track, move the scale track if possible
    if (!isThisPattern && isOtherPattern) {
      const index = otherTrackParent?.trackIds.indexOf(otherTrack.id);
      if (index === undefined || index === -1) return false;
      dispatch(moveTrackInHierarchy({ id: thisTrack.id, index }));
      return true;
    }

    // Get the corresponding scale tracks
    const thisParent = thisTrack.parentId
      ? selectScaleTrackById(project, thisTrack.parentId)
      : null;
    const otherParent = otherTrack.parentId
      ? selectScaleTrackById(project, otherTrack.parentId)
      : null;
    if (!thisParent || !otherParent) return false;

    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisParent.id === otherParent.id) {
      const index = trackNodeMap[thisParent.id].trackIds.indexOf(otherTrack.id);
      dispatch(
        moveTrackInHierarchy({
          id: thisTrack.id,
          index,
        })
      );
    }

    // If the pattern tracks are in different scale tracks, do nothing
    return false;
  };
