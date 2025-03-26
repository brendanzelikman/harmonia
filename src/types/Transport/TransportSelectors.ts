import { Project } from "types/Project/ProjectTypes";
import { createSelector } from "reselect";
import { percent } from "utils/math";
import { MAX_TRANSPORT_VOLUME, MIN_TRANSPORT_VOLUME } from "utils/constants";

/** Select the transport state */
export const selectTransport = (project: Project) => project.present.transport;

/** Select the transport BPM. */
export const selectTransportBPM = createSelector(
  [selectTransport],
  (transport) => transport.bpm
);

/** Select the transport time signature. */
export const selectTransportTimeSignature = createSelector(
  [selectTransport],
  (transport) => transport.timeSignature
);

/** Select the transport recording state. */
export const selectTransportRecording = createSelector(
  [selectTransport],
  (transport) => transport.recording
);

/** Select the transport loop state. */
export const selectTransportLoop = createSelector(
  [selectTransport],
  (transport) => transport.loop
);

/** Select the transport volume. */
export const selectTransportVolume = createSelector(
  [selectTransport],
  (transport) => transport.volume
);

/** Select the transport mute state. */
export const selectTransportMute = createSelector(
  [selectTransport],
  (transport) => transport.mute
);

/** Select the transport volume percent. */
export const selectTransportVolumePercent = createSelector(
  [selectTransportVolume, selectTransportMute],
  (volume, mute) => {
    const vol = mute ? MIN_TRANSPORT_VOLUME : volume;
    return percent(vol, MIN_TRANSPORT_VOLUME, MAX_TRANSPORT_VOLUME);
  }
);
