import { RootState } from "redux/store";
import { selectClips, selectClipStream } from "./clips";

// Select the transport from the store.
export const selectTransport = (state: RootState) => {
  return state.transport;
};

// Select the loop time or the end time of the last clip that is active
export const selectTransportEndTime = (state: RootState) => {
  const transport = selectTransport(state);
  if (transport.loop) return transport.loopEnd;

  const clips = selectClips(state);
  const streams = clips.map((clip) => selectClipStream(state, clip.id));
  const lastTime = clips.reduce((last, clip, i) => {
    const stream = streams[i];
    if (!stream) return last;
    const endTime = clip.startTime + stream.length;
    return Math.max(last, endTime);
  }, 0);
  return lastTime;
};
