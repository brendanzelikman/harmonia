import { RootState } from "redux/store";
import { selectClips, selectClipStream } from "./clips";

// Select the transport from the store.
export const selectTransport = (state: RootState) => {
  return state.transport;
};

export const selectTick = (state: RootState, tick: number) => tick;

// Select the loop tick or the end tick of the last clip that is active
export const selectTransportEndTick = (state: RootState) => {
  const transport = selectTransport(state);
  if (transport.loop) return transport.loopEnd;

  const clips = selectClips(state);
  const streams = clips.map((clip) => selectClipStream(state, clip.id));
  const lastTick = clips.reduce((last, clip, i) => {
    const stream = streams[i];
    if (!stream) return last;
    const endTick = clip.tick + stream.length;
    return Math.max(last, endTick);
  }, 0);
  return lastTick;
};
