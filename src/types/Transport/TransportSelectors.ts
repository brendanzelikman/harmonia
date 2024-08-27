import { Project } from "types/Project/ProjectTypes";
import { isTransportStarted } from "./TransportFunctions";
import { createSelector } from "reselect";

/** Select the transport state */
export const selectTransport = (project: Project) => project.present.transport;

/** Select the transport BPM. */
export const selectTransportBPM = (project: Project) =>
  project.present.transport.bpm;

/** Select the transport time signature. */
export const selectTransportTimeSignature = (project: Project) =>
  project.present.transport.timeSignature;

export const selectIsTransportActive = createSelector(
  selectTransport,
  (transport) => isTransportStarted(transport) || transport.recording
);
