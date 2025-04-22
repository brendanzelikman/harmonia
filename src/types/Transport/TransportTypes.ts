import { DEFAULT_BPM } from "utils/constants";
import { BPM, Seconds, Volume } from "../units";
import { WholeNoteTicks } from "utils/duration";

/** The Transport mirrors and stores the Tone.js transport. */
export interface Transport {
  bpm: BPM;
  timeSignature: number;
  swing: number;
  loop: boolean;
  loopStart: Seconds;
  loopEnd: Seconds;
  volume: Volume;
  mute: boolean;
  scroll: number;
}

/** The default transport settings. */
export const defaultTransport: Transport = {
  bpm: DEFAULT_BPM,
  timeSignature: 4,
  swing: 0,
  loop: true,
  loopStart: 0,
  loopEnd: WholeNoteTicks - 1,
  volume: 0,
  mute: false,
  scroll: 0,
};
