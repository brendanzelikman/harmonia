import { Thunk } from "types/Project";
import { TrackId } from "types/Track";
import { InstrumentKey, initializeInstrument } from "types/Instrument";
import {
  PatternTrack,
  initializePatternTrack,
  isPatternTrack,
  isScaleTrack,
} from "types/Track";
import {
  createInstrument,
  selectInstrumentById,
  updateInstrument,
} from "redux/Instrument";
import {
  selectTrackById,
  selectSelectedTrack,
  selectPatternTrackById,
  selectTrackInstrument,
  selectTrackMap,
} from "redux/selectors";
import { addTrack, migrateTrack, moveTrack } from "./TrackSlice";
import { getValueByKey } from "utils/objects";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";

/** Create a `PatternTrack` with an optional initial track. */
export const createPatternTrack =
  (
    initialTrack?: Partial<PatternTrack>,
    initialInstrumentKey?: InstrumentKey
  ): Thunk<TrackId> =>
  (dispatch, getProject) => {
    const project = getProject();

    // Initialize a new pattern track and instrument
    const instrument = initializeInstrument({ key: initialInstrumentKey });
    const patternTrack = initializePatternTrack({
      ...initialTrack,
      instrumentId: instrument.id,
    });

    // Create the pattern track
    dispatch(addTrack({ track: patternTrack }));

    // Create an instrument for the track or use the old one
    const oldInstrument = initialTrack?.instrumentId
      ? selectInstrumentById(project, initialTrack.instrumentId)
      : undefined;
    dispatch(
      createInstrument(patternTrack, {
        oldInstrument: {
          ...oldInstrument,
          ...instrument,
          key: initialInstrumentKey ?? DEFAULT_INSTRUMENT_KEY,
        },
      })
    );

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

/** Set the `ScaleTrack` of a `PatternTrack` with an optional index. */
export const setPatternTrackScaleTrack =
  (patternTrackId: TrackId, parentId: TrackId, index?: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the pattern track
    const patternTrack = selectPatternTrackById(project, patternTrackId);
    if (!patternTrack) return;

    // Migrate the pattern track to the new parent
    dispatch(migrateTrack({ id: patternTrackId, parentId, index }));
  };

/** Set the instrument of a `PatternTrack`. */
export const setPatternTrackInstrument =
  (id?: TrackId, key?: InstrumentKey): Thunk =>
  (dispatch, getProject) => {
    if (!id || !key) return;
    const project = getProject();

    // Get the instrument
    const instrument = selectTrackInstrument(project, id);
    if (!instrument) return;

    // Update the instrument with the new instrument
    dispatch(updateInstrument({ id: instrument.id, update: { key } }));
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
    const trackMap = selectTrackMap(project);

    // Get the corresponding pattern tracks
    const thisTrack = selectTrackById(project, dragId);
    const otherTrack = selectTrackById(project, hoverId);
    if (!thisTrack || !otherTrack) return false;

    const otherTrackParent = getValueByKey(trackMap, otherTrack?.parentId);
    const isThisPattern = isPatternTrack(thisTrack);
    const isOtherPattern = isPatternTrack(otherTrack);

    // If this = scale track and other = pattern track, move the scale track if possible
    if (!isThisPattern && isOtherPattern) {
      const index = otherTrackParent?.trackIds.indexOf(otherTrack.id);
      if (index === undefined || index < 0) return false;
      dispatch(moveTrack({ id: thisTrack.id, index }));
      return true;
    }

    // Get the corresponding scale tracks
    const thisParent = selectTrackById(project, thisTrack.parentId);
    const otherParent = selectTrackById(project, otherTrack.parentId);
    if (!thisParent || !otherParent) return false;

    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisParent.id === otherParent.id) {
      const index = trackMap[thisParent.id].trackIds.indexOf(otherTrack.id);
      dispatch(moveTrack({ id: thisTrack.id, index }));
    }

    // If the pattern tracks are in different scale tracks, do nothing
    return false;
  };
