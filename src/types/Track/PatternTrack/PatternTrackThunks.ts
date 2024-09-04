import { getValueByKey } from "utils/objects";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import {
  PatternTrack,
  PatternTrackId,
  initializePatternTrack,
} from "./PatternTrackTypes";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import {
  InstrumentKey,
  initializeInstrument,
} from "types/Instrument/InstrumentTypes";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectPatternTrackById,
  selectTrackInstrument,
  selectTrackMap,
  selectTrackById,
  selectTopLevelTracks,
} from "../TrackSelectors";
import { TrackId, isPatternTrack, isScaleTrack } from "../TrackTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { selectSelectedTrack } from "types/Timeline/TimelineSelectors";
import { createUndoType } from "lib/redux";
import { UndoType } from "types/units";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { migrateTrack, moveTrack } from "../TrackThunks";
import { addTrack } from "../TrackThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import { getTrackLabel } from "../TrackFunctions";
import { setTimelineType } from "types/Timeline/TimelineThunks";
import { createMedia } from "types/Media/MediaThunks";
import {
  initializePatternClip,
  initializePoseClip,
} from "types/Clip/ClipTypes";
import { createPose } from "types/Pose/PoseThunks";
import { ScaleTrackId } from "../ScaleTrack/ScaleTrackTypes";

/** Create a `PatternTrack` with an optional initial track. */
export const createPatternTrack =
  (
    initialTrack?: Partial<PatternTrack>,
    initialInstrumentKey?: InstrumentKey,
    _undoType?: UndoType
  ): Thunk<PatternTrackId> =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackMap = selectTrackMap(project);
    const topLevelTracks = selectTopLevelTracks(project);

    // Initialize a new pattern track and instrument
    const instrument = initializeInstrument({ key: initialInstrumentKey });
    const track = initializePatternTrack({
      ...initialTrack,
      instrumentId: instrument.id,
      order: initialTrack?.parentId ? undefined : topLevelTracks.length,
    });
    const id = track.id;

    const undoType = _undoType ?? createUndoType("createPatternTrack", track);

    // Create the pattern track
    dispatch(addTrack({ data: track, undoType }));

    // Create an instrument for the track or use the old one
    const iid = initialTrack?.instrumentId;
    const oldInstrument = iid ? selectInstrumentById(project, iid) : undefined;
    const key = initialInstrumentKey ?? DEFAULT_INSTRUMENT_KEY;
    const options = { oldInstrument: { ...oldInstrument, ...instrument, key } };
    dispatch(createInstrument({ data: { track: track, options }, undoType }));

    // Return ID of the created track
    return track.id;
  };

/** Create a `PatternTrack` using the selected track as a parent. */
export const createPatternTrackFromSelectedTrack =
  (): Thunk<TrackId | undefined> => (dispatch, getProject) => {
    const project = getProject();
    const parent = selectSelectedTrack(project);
    const parentId = isScaleTrack(parent) ? parent.id : parent?.parentId;
    return dispatch(createPatternTrack({ parentId }));
  };

/** Set the `ScaleTrack` of a `PatternTrack` with an optional index. */
export const setPatternTrackScaleTrack =
  (
    patternTrackId: PatternTrackId,
    parentId: ScaleTrackId,
    index?: number
  ): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the pattern track
    const patternTrack = selectPatternTrackById(project, patternTrackId);
    if (!patternTrack) return;

    // Migrate the pattern track to the new parent
    dispatch(migrateTrack({ data: { id: patternTrackId, parentId, index } }));
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
    dispatch(
      updateInstrument({ data: { id: instrument.id, update: { key } } })
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
      dispatch(moveTrack({ data: { id: thisTrack.id, index } }));
      return true;
    }

    // Get the corresponding scale tracks
    if (!thisTrack.parentId || !otherTrack.parentId) return false;
    const thisParent = selectTrackById(project, thisTrack.parentId);
    const otherParent = selectTrackById(project, otherTrack.parentId);
    if (!thisParent || !otherParent) return false;

    // If the pattern tracks are in the same scale track, move the pattern track
    if (thisParent.id === otherParent.id) {
      const thisParentTrack = trackMap[thisParent.id] as PatternTrack;
      if (!thisParentTrack) return false;
      const index = thisParentTrack.trackIds.indexOf(otherTrack.id);
      dispatch(moveTrack({ data: { id: thisTrack.id, index } }));
    }

    // If the pattern tracks are in different scale tracks, do nothing
    return false;
  };
