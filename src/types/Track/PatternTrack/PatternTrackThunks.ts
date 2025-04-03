import { DEFAULT_INSTRUMENT_KEY, SAMPLE_STORE } from "utils/constants";
import {
  PatternTrack,
  PatternTrackId,
  initializePatternTrack,
} from "./PatternTrackTypes";
import {
  Instrument,
  InstrumentKey,
  initializeInstrument,
} from "types/Instrument/InstrumentTypes";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectPatternTrackById,
  selectTopLevelTracks,
  selectTrackById,
} from "../TrackSelectors";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { Payload, unpackData, unpackUndoType } from "lib/redux";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { addTrack } from "../TrackThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import {
  initializePatternClip,
  initializePoseClip,
  PatternClip,
  PatternClipId,
  PoseClip,
} from "types/Clip/ClipTypes";
import { getTransport } from "tone";
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
import { isHoldingOption, promptUserForAudioFile } from "utils/html";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { getDatabase } from "providers/idb/database";
import { fileToAudioBuffer, audioBufferToObject } from "utils/samples";
import { Track, TrackId, isPatternTrack } from "../TrackTypes";
import { uploadSampleToIDB } from "providers/idb/samples";

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
      Partial<{ pattern: Partial<Pattern>; clip: Partial<PatternClip> }>
    >
  ): Thunk<{ patternId: PatternId; clipId: PatternClipId }> =>
  (dispatch, getProject) => {
    const { clip } = payload.data;
    const undoType = unpackUndoType(payload, "createCourtesyPatternClip");
    const patternId = payload.data?.pattern?.id;
    const initialPattern = patternId
      ? selectPatternById(getProject(), patternId)
      : {};
    const pattern = dispatch(
      createPattern({
        data: {
          ...initialPattern,
          ...payload.data.pattern,
          trackId: clip?.trackId,
        },
        undoType,
      })
    );
    const patternClip = initializePatternClip({
      ...clip,
      patternId: pattern.id,
      tick: clip?.tick ?? getTransport().ticks,
    });
    const [clipId] = dispatch(
      createMedia({ data: { clips: [patternClip] }, undoType })
    ).data.clipIds!;
    return { patternId: pattern.id, clipId: clipId as PatternClipId };
  };

export const createCourtesyPoseClip =
  (
    payload: Payload<Partial<{ pose: Partial<Pose>; clip: Partial<PoseClip> }>>
  ): Thunk<PoseId> =>
  (dispatch) => {
    const { clip } = payload.data;
    const undoType = unpackUndoType(payload, "createCourtesyPoseClip");
    const pose = dispatch(
      createPose({
        data: { ...payload.data.pose, trackId: clip?.trackId },
        undoType,
      })
    );
    const poseClip = initializePoseClip({
      ...clip,
      poseId: pose.id,
      tick: clip?.tick ?? getTransport().ticks,
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
    if (!e || !isHoldingOption(e)) {
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
    if (!e || !isHoldingOption(e)) {
      const update = { solo: !instrument.solo };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.solo ? unsoloTracks() : soloTracks());
  };

/** Prompt the user for an audio file and upload / create a track. */
export const promptUserForSample =
  (payload: Payload<{ track?: Track; parentId?: TrackId }, true>): Thunk =>
  (dispatch) => {
    const { track, parentId } = unpackData(payload);
    const undoType = unpackUndoType(payload, "promptUserForSample");
    promptUserForAudioFile((e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // If no track data is provided, just upload the sample
      if (!track && !parentId) {
        uploadSampleToIDB(file);
        return;
      }

      // Otherwise, use the data to create/update a track
      const data = { track, parentId, file };
      dispatch(uploadSampleToTrack({ data, undoType }));
    });
  };

/** Use a file to create a custom instrument for a track. */
export const uploadSampleToTrack =
  (
    payload: Payload<{ file: File; track?: Track; parentId?: TrackId }>
  ): Thunk =>
  async (dispatch, getProject) => {
    const data = unpackData(payload);
    const undoType = unpackUndoType(payload, "uploadSampleToTrack");
    const project = getProject();
    const db = await getDatabase();
    if (!db) return;

    // Convert the file to a safe buffer and save to IDB
    const { file, parentId } = data;
    const audioBuffer = await fileToAudioBuffer(file);
    const buffer = audioBufferToObject(audioBuffer);
    const id = `sample-${file.name}`;
    await db.put(SAMPLE_STORE, { id, buffer });

    // Use the provided track or create a new one from the parent
    let track: PatternTrack;
    let instrument: Instrument | undefined;
    if (isPatternTrack(data.track)) {
      track = data.track;
      instrument = selectInstrumentById(project, data.track.instrumentId);
    } else {
      const data = { track: { parentId } };
      const newPT = dispatch(createPatternTrack({ data, undoType }));
      track = newPT.track;
      instrument = newPT.instrument;
    }

    // Create a new instrument with the sample
    const urls = { C3: audioBuffer };
    let oldInstrument: Instrument | undefined = undefined;
    if (instrument) oldInstrument = { ...instrument, key: id as InstrumentKey };

    const options = { oldInstrument, urls };
    dispatch(createInstrument({ data: { track, options }, undoType }));
  };
