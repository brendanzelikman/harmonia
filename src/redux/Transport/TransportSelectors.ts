import { RootState } from "redux/store";

/**
 * Select the transport state from the Redux store.
 * @param state - The root state.
 * @returns The transport.
 */
export const selectTransport = (state: RootState) => state.transport;

/**
 * Select the transport BPM.
 * @param state - The root state.
 */
export const selectTransportBPM = (state: RootState) => state.transport.bpm;

/**
 * Select the transport time signature.
 * @param state - The root state.
 */
export const selectTransportTimeSignature = (state: RootState) =>
  state.transport.timeSignature;
