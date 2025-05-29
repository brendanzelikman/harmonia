import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import {
  PatternTrack,
  PatternTrackId,
  initializePatternTrack,
} from "./PatternTrackTypes";
import {
  Instrument,
  initializeInstrument,
} from "types/Instrument/InstrumentTypes";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectPatternTrackById,
  selectTopLevelTracks,
  selectTrackById,
} from "../TrackSelectors";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { Payload, unpackUndoType } from "types/redux";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { addTrack } from "../TrackThunks";
import { createPattern, randomizePattern } from "types/Pattern/PatternThunks";
import {
  initializePatternClip,
  initializePoseClip,
  PatternClip,
  PatternClipId,
  PoseClip,
} from "types/Clip/ClipTypes";
import { createMedia } from "types/Media/MediaThunks";
import { createPose } from "types/Pose/PoseThunks";
import { Pattern, PatternId } from "types/Pattern/PatternTypes";
import { Pose, PoseId } from "types/Pose/PoseTypes";
import {
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
  updateInstrument,
} from "types/Instrument/InstrumentSlice";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { selectCurrentTimelineTick } from "types/Timeline/TimelineSelectors";
import { updatePattern } from "types/Pattern/PatternSlice";
import { autoBindStreamToTrack } from "../TrackUtils";

/** Create a `PatternTrack` with an optional initial track. */
export const createPatternTrack =
  (
    payload: Payload<{
      track?: Partial<PatternTrack>;
      instrument?: Partial<Instrument>;
    }>
  ): Thunk<{
    track: PatternTrack;
    instrument: Instrument;
  }> =>
  (dispatch, getProject) => {
    const project = getProject();
    const topLevelTracks = selectTopLevelTracks(project);
    const initialTrack = payload.data?.track;
    const initialInstrument = payload.data?.instrument;
    const initialInstrumentKey = payload.data?.instrument?.key;

    // Initialize a new pattern track and instrument
    const instrument = initializeInstrument({ key: initialInstrumentKey });
    const track = initializePatternTrack({
      ...initialTrack,
      instrumentId: instrument.id,
      order: !!initialTrack?.parentId
        ? selectTrackById(project, initialTrack.parentId)?.trackIds?.length ?? 0
        : topLevelTracks.length,
    });

    const undoType = unpackUndoType(payload, "createPatternTrack");

    // Create the pattern track
    dispatch(addTrack({ data: track, undoType }));

    // Create an instrument for the track or use the old one
    const iid = initialInstrument?.id ?? initialTrack?.instrumentId;
    const oldInstrument = iid ? selectInstrumentById(project, iid) : undefined;
    const key = initialInstrumentKey ?? DEFAULT_INSTRUMENT_KEY;
    const options = {
      oldInstrument: {
        ...instrument,
        ...oldInstrument,
        ...initialInstrument,
        id: instrument.id,
        key,
      },
    };
    dispatch(createInstrument({ data: { track, options }, undoType }));

    // Return ID of the created track
    return { track, instrument };
  };

export const createCourtesyPatternClip =
  (
    payload: Payload<
      Partial<{
        pattern: Partial<Pattern>;
        clip: Partial<PatternClip>;
        autobind?: boolean;
        randomize?: boolean;
      }>
    >
  ): Thunk<{ patternId: PatternId; clipId: PatternClipId }> =>
  (dispatch, getProject) => {
    const project = getProject();
    const { clip, autobind, randomize } = payload.data;
    const undoType = unpackUndoType(payload, "createCourtesyPatternClip");
    const patternId = payload.data?.pattern?.id;
    const initialPattern = patternId
      ? selectPatternById(project, patternId)
      : {};
    const pattern = dispatch(
      createPattern({
        data: {
          ...initialPattern,
          ...payload.data.pattern,
        },
        undoType,
      })
    );
    const tick = selectCurrentTimelineTick(project);
    const patternClip = initializePatternClip({
      ...clip,
      patternId: pattern.id,
      tick: clip?.tick ?? tick,
    });
    const { trackId } = patternClip;
    let newStream = pattern.stream;
    if (randomize) {
      newStream = dispatch(
        randomizePattern({ data: { id: pattern.id, trackId }, undoType })
      );
    }
    if (autobind) {
      const stream = dispatch(autoBindStreamToTrack(trackId, newStream));
      dispatch(updatePattern({ data: { id: pattern.id, stream }, undoType }));
    }
    const [clipId] = dispatch(
      createMedia({ data: { clips: [patternClip] }, undoType })
    ).data.clipIds!;
    return { patternId: pattern.id, clipId: clipId as PatternClipId };
  };

export const createNewPoseClip =
  (
    payload: Payload<Partial<{ pose: Partial<Pose>; clip: Partial<PoseClip> }>>
  ): Thunk<PoseId> =>
  (dispatch, getProject) => {
    const { clip } = payload.data;
    const undoType = unpackUndoType(payload, "createNewPoseClip");
    const pose = dispatch(
      createPose({
        data: { ...payload.data.pose },
        undoType,
      })
    );
    const tick = selectCurrentTimelineTick(getProject());
    const poseClip = initializePoseClip({
      ...clip,
      poseId: pose.id,
      tick: clip?.tick ?? tick,
    });
    dispatch(createMedia({ data: { clips: [poseClip] }, undoType })).data;
    return pose.id;
  };

/** Mute all tracks. */
export const muteTracks = (): Thunk => (dispatch) => {
  dispatch(muteInstruments());
};

/** Unmute all tracks. */
export const unmuteTracks = (): Thunk => (dispatch) => {
  dispatch(unmuteInstruments());
};

/** Solo all tracks. */
export const soloTracks = (): Thunk => (dispatch) => {
  dispatch(soloInstruments());
};

/** Unsolo all tracks. */
export const unsoloTracks = (): Thunk => (dispatch) => {
  dispatch(unsoloInstruments());
};

/** Toggle the mute state of a track. */
export const toggleTrackMute =
  (e: MouseEvent, id: PatternTrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track mute
    if (!e || !e.altKey) {
      const update = { mute: !instrument.mute };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.mute ? unmuteTracks() : muteTracks());
  };

/** Toggle the solo state of a track. */
export const toggleTrackSolo =
  (e: MouseEvent, id: PatternTrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track solo
    if (!e || !e.altKey) {
      const update = { solo: !instrument.solo };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.solo ? unsoloTracks() : soloTracks());
  };
