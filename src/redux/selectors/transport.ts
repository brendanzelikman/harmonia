import { RootState } from "redux/store";

// Select the transport from the store.
export const selectTransport = (state: RootState) => {
  return state.transport;
};

export const selectTick = (state: RootState, tick: number) => tick;
