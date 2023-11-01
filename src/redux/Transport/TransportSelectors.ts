import { Project } from "types/Project";

/** Select the transport state */
export const selectTransport = (project: Project) => project.transport;

/** Select the transport BPM. */
export const selectTransportBPM = (project: Project) => project.transport.bpm;

/** Select the transport time signature. */
export const selectTransportTimeSignature = (project: Project) =>
  project.transport.timeSignature;
