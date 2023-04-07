import { getDestination, Recorder } from "tone";

export const RECORDER = new Recorder();
getDestination().connect(RECORDER);
