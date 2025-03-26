import { DEFAULT_BPM } from "utils/constants";
import { BPM, Seconds, Volume } from "../units";
import { WholeNoteTicks } from "utils/durations";

/** The `Transport` contains information about playback and the Tone.js Transport. */
export interface Transport {
  bpm: BPM;
  timeSignature: [number, number];
  loop: boolean;
  loopStart: Seconds;
  loopEnd: Seconds;
  volume: Volume;
  mute: boolean;
  recording: boolean;
  downloading: boolean;
}

export const defaultTransport: Transport = {
  bpm: DEFAULT_BPM,
  loop: true,
  loopStart: 0,
  loopEnd: WholeNoteTicks - 1,
  volume: 0,
  mute: false,
  timeSignature: [16, 16],
  recording: false,
  downloading: false,
};
