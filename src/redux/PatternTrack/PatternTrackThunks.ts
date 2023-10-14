import { AppThunk } from "redux/store";
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
  addPatternTrackToSession,
  migrateTrackInSession,
  moveTrackInSession,
  selectSessionMap,
} from "redux/Session";
import { selectScaleTrackById } from "redux/ScaleTrack";
import { selectTrackById, selectSelectedTrack } from "redux/selectors";

/**
 * Create a `PatternTrack` with an optional initial track.
 * @param initialTrack - The initial track to create.
 * @returns A Promise that resolves with the ID of the created track.
 */
export const createPatternTrack =
  (initialTrack?: Partial<PatternTrack>): AppThunk<Promise<TrackId>> =>
  (dispatch, getState) => {
    const state = getState();
    return new Promise(async (resolve) => {
      // Initialize a new pattern track and instrument
      const instrument = initializeInstrument();
      const patternTrack = initializePatternTrack({
        ...initialTrack,
        instrumentId: instrument.id,
      });

      // Create the pattern track
      dispatch(addPatternTrack(patternTrack));
      dispatch(addPatternTrackToSession(patternTrack));

      // Create an instrument for the track or use the old one
      const oldInstrument = initialTrack?.instrumentId
        ? selectInstrumentById(state, initialTrack.instrumentId)
        : undefined;
      dispatch(createInstrument(patternTrack, { oldInstrument }));

      // Resolve with the ID of the created track
      resolve(patternTrack.id);
    });
  };

/**
 * Create a `PatternTrack` using the selected track as a parent.
 * @returns A Promise that resolves with the ID of the created track.
 */
export const createPatternTrackFromSelectedTrack =
  (): AppThunk<Promise<TrackId>> => (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const state = getState();
      const parent = selectSelectedTrack(state);
      if (!parent) return;
      const parentId = isScaleTrack(parent) ? parent.id : parent.parentId;
      resolve(dispatch(createPatternTrack({ parentId })));
    });
  };

/**
 * Set the `ScaleTrack` of a `PatternTrack` with an optional index.
 * @param patternTrackId - The ID of the PatternTrack to update.
 * @param parentId - The ID of the ScaleTrack to set.
 * @param index - The index to add the PatternTrack to.
 */
export const setPatternTrackScaleTrack =
  (patternTrackId: TrackId, parentId: TrackId, index?: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the pattern track
    const patternTrack = selectPatternTrackById(state, patternTrackId);
    if (!patternTrack) return;

    // Update the pattern track with the new parent
    const newTrack = { ...patternTrack, parentId };
    dispatch(updatePatternTrack(newTrack));
    dispatch(
      migrateTrackInSession({
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
  (id: TrackId, key: InstrumentKey): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the instrument
    const instrument = selectPatternTrackInstrument(state, id);
    if (!instrument) return;

    // Update the instrument with the new instrument
    dispatch(
      updateInstrument({
        instrumentId: instrument.id,
        update: { key },
      })
    );
  };

/**
 * Move a pattern track to the index of the given track ID.
 * @param props The drag and hover IDs.
 */
export const movePatternTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverId } = props;
    const state = getState();
    const sessionMap = selectSessionMap(state);

    // Get the corresponding pattern tracks
    const thisTrack = selectTrackById(state, dragId);
    const otherTrack = selectTrackById(state, hoverId);
    if (!thisTrack || !otherTrack) return false;

    const otherTrackParent = otherTrack.parentId
      ? sessionMap[otherTrack.parentId]
      : null;

    const isThisPattern = isPatternTrack(thisTrack);
    const isOtherPattern = isPatternTrack(otherTrack);

    // If this = scale track and other = pattern track, move the scale track if possible
    if (!isThisPattern && isOtherPattern) {
      const index = otherTrackParent?.trackIds.indexOf(otherTrack.id);
      if (index === undefined || index === -1) return false;
      dispatch(moveTrackInSession({ id: thisTrack.id, index }));
      return true;
    }

    // Get the corresponding scale tracks
    const thisParent = thisTrack.parentId
      ? selectScaleTrackById(state, thisTrack.parentId)
      : null;
    const otherParent = otherTrack.parentId
      ? selectScaleTrackById(state, otherTrack.parentId)
      : null;
    if (!thisParent || !otherParent) return false;

    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisParent.id === otherParent.id) {
      const index = sessionMap[thisParent.id].trackIds.indexOf(otherTrack.id);
      dispatch(
        moveTrackInSession({
          id: thisTrack.id,
          index,
        })
      );
    }

    // If the pattern tracks are in different scale tracks, do nothing
    return false;
  };
