import { Project } from "types/Project/ProjectTypes";
import { createSelector } from "reselect";
import { percentize } from "utils/math";
import { MAX_VOLUME, MIN_VOLUME } from "utils/constants";

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

/** Select the transport swing. */
export const selectTransportSwing = createSelector(
  [selectTransport],
  (transport) => transport.swing
);

/** Select the transport loop state. */
export const selectTransportLoop = createSelector(
  [selectTransport],
  (transport) => transport.loop
);

/** Select the transport loop start. */
export const selectTransportLoopStart = createSelector(
  [selectTransport],
  (transport) => transport.loopStart
);

/** Select the transport loop end. */
export const selectTransportLoopEnd = createSelector(
  [selectTransport],
  (transport) => transport.loopEnd
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
  (volume, mute) =>
    percentize(mute ? MIN_VOLUME : volume, MIN_VOLUME, MAX_VOLUME)
);
