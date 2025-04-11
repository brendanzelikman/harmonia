import { getHeldKey } from "hooks/useHeldkeys";
import {
  toggleInstrumentMute,
  toggleInstrumentSolo,
} from "types/Instrument/InstrumentSlice";
import { Thunk } from "types/Project/ProjectTypes";
import {
  unmuteTracks,
  unsoloTracks,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { selectPatternTracks } from "types/Track/TrackSelectors";

/* Gesture to mute and solo tracks by index */
export const mixSamplerByIndex =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternTracks = selectPatternTracks(project);
    const instrumentId = patternTracks[number - 1]?.instrumentId;
    if (getHeldKey("m")) dispatch(toggleInstrumentMute(instrumentId));
    if (getHeldKey("s")) dispatch(toggleInstrumentSolo(instrumentId));
  };

/** Gesture to unmute and unsolo all tracks */
export const resetSamplersGesture = (): Thunk => (dispatch) => {
  if (getHeldKey("m")) dispatch(unmuteTracks());
  if (getHeldKey("s")) dispatch(unsoloTracks());
};
