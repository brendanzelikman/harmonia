import { Project } from "types/Project";

/**
 * Select the transport state from the Redux store.
 * @param project - The project.
 * @returns The transport.
 */
export const selectTransport = (project: Project) => project.transport;

/**
 * Select the transport BPM.
 * @param project - The project.
 */
export const selectTransportBPM = (project: Project) => project.transport.bpm;

/**
 * Select the transport time signature.
 * @param project - The project.
 */
export const selectTransportTimeSignature = (project: Project) =>
  project.transport.timeSignature;
