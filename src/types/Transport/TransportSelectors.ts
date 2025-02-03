import { Project } from "types/Project/ProjectTypes";
import { isTransportStarted } from "./TransportFunctions";
import { createSelector } from "reselect";
import { percent } from "utils/math";
import { MAX_TRANSPORT_VOLUME, MIN_TRANSPORT_VOLUME } from "utils/constants";
import { createDeepSelector } from "lib/redux";

/** Select the transport state */
export const selectTransport = (project: Project) => project.present.transport;

/** Select the transport volume. */
export const selectTransportVolume = (project: Project) =>
  project.present.transport.volume;

/** Select the transport mute state. */
export const selectTransportMute = (project: Project) =>
  project.present.transport.mute;

/** Select the transport volume percent. */
export const selectTransportVolumePercent = createSelector(
  [selectTransportVolume, selectTransportMute],
  (volume, mute) =>
    percent(
      mute ? MIN_TRANSPORT_VOLUME : volume,
      MIN_TRANSPORT_VOLUME,
      MAX_TRANSPORT_VOLUME
    )
);

/** Select the transport BPM. */
export const selectTransportBPM = (project: Project) =>
  project.present.transport.bpm;

/** Select the transport time signature. */
export const selectTransportTimeSignature = (project: Project) =>
  project.present.transport.timeSignature;

/** Select true if the transport is active. */
export const selectIsTransportActive = createSelector(
  selectTransport,
  (transport) => isTransportStarted(transport) || transport.recording
);

/** Select true if the playhead should show. */
export const selectIsPlayheadVisible = createSelector(
  selectTransport,
  (transport) => transport.state === "started" && !transport.downloading
);

/** Select a group of properties based on the transport state. */
export const selectTransportState = createDeepSelector(
  selectTransport,
  (transport) => ({
    isStarted: transport.state === "started",
    isStopped: transport.state === "stopped",
    isPaused: transport.state === "paused",
    isIdle: transport.state === "stopped" && !transport.recording,
    isRecording: !!transport.recording,
    isLooping: !!transport.loop,
  })
);

/** Select the loop start of the transport. */
export const selectTransportLoopStart = (project: Project) =>
  project.present.transport.loopStart;

/** Select the loop end of the transport. */
export const selectTransportLoopEnd = (project: Project) =>
  project.present.transport.loopEnd;
