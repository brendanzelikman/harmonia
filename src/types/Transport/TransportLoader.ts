import { dispatchClose, dispatchOpen } from "hooks/useToggle";
import * as Tone from "tone";
import { LIVE_RECORDER_INSTANCE } from "types/Instrument/InstrumentClass";
import {
  createGlobalInstrument,
  buildInstruments,
  destroyInstruments,
} from "types/Instrument/InstrumentThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { selectPatternTracks } from "types/Track/TrackSelectors";
import { PPQ } from "utils/duration";
import { selectTransport } from "./TransportSelectors";
import { stopTransport } from "./TransportState";
import { stopDownloadingTransport } from "./TransportDownloader";

// --------------------------------------------------------------
// Events
// --------------------------------------------------------------

export const LOAD_TRANSPORT = "load-transport";

/** Dispatch an event to start loading the transport. */
export const dispatchLoadTransport = () => {
  dispatchOpen(LOAD_TRANSPORT);
};
/** Dispatch an event to stop loading the transport. */
export const dispatchUnloadTransport = () => {
  dispatchClose(LOAD_TRANSPORT);
};

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

/** Load the transport on mount. */
export const loadTransport = (): Thunk => async (dispatch, getProject) => {
  dispatchUnloadTransport();

  // Build the instruments
  const project = getProject();
  const transport = selectTransport(project);
  const patternTracks = selectPatternTracks(project);

  // Wait for the Tone context to be ready
  await Tone.start();

  // Copy the transport state into the Tone transport
  const { bpm, timeSignature, volume, mute } = transport;
  Tone.getTransport().PPQ = PPQ;
  Tone.getTransport().bpm.value = bpm;
  Tone.getTransport().timeSignature = timeSignature;
  Tone.getDestination().volume.value = volume;
  Tone.getDestination().mute = mute;

  // Create the global instrument
  createGlobalInstrument();

  // Connect the recorder
  Tone.getDestination().connect(LIVE_RECORDER_INSTANCE);

  // Build the instruments from the pattern tracks
  await dispatch(buildInstruments(patternTracks));

  // Signal that the transport is loaded
  dispatchLoadTransport();
};

/** Stop the transport and destroy all instruments. */
export const unloadTransport = () => {
  stopTransport();
  destroyInstruments();
  stopDownloadingTransport();
};
