import { getHeldKey } from "hooks/useHeldkeys";
import { clamp } from "lodash";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import {
  toggleInstrumentMute,
  toggleInstrumentSolo,
  updateInstrument,
} from "types/Instrument/InstrumentSlice";
import { Thunk } from "types/Project/ProjectTypes";
import {
  unmuteTracks,
  unsoloTracks,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { selectPatternTracks } from "types/Track/TrackSelectors";
import { MAX_VOLUME, MIN_VOLUME } from "utils/constants";

/** Gesture to mute track by index */
export const muteTrackGesture =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternTracks = selectPatternTracks(project);
    const instrumentId = patternTracks[number - 1]?.instrumentId;
    dispatch(toggleInstrumentMute(instrumentId));
  };

/** Gesture to solo track by index */
export const soloTrackGesture =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternTracks = selectPatternTracks(project);
    const instrumentId = patternTracks[number - 1]?.instrumentId;
    dispatch(toggleInstrumentSolo(instrumentId));
  };

/** Gesture to change the volume of a track */
export const changeTrackVolumeGesture =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternTracks = selectPatternTracks(project);
    const instrumentId = patternTracks[number - 1]?.instrumentId;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;
    const isNegative = getHeldKey("`") || getHeldKey("-");
    const isEqual = getHeldKey("=");
    const offset = isEqual ? 5 : 1;
    const _volume = isNegative
      ? instrument.volume - offset
      : instrument.volume + offset;
    const volume = clamp(_volume, MIN_VOLUME, MAX_VOLUME);
    dispatch(
      updateInstrument({ data: { id: instrumentId, update: { volume } } })
    );
  };

/** Gesture to unmute and unsolo all tracks */
export const resetSamplersGesture = (): Thunk => (dispatch) => {
  if (getHeldKey("m")) dispatch(unmuteTracks());
  if (getHeldKey("s")) dispatch(unsoloTracks());
};
