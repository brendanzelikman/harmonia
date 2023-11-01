import { PlaybackState } from "tone";
import {
  DEFAULT_BPM,
  MAX_BPM,
  MAX_VOLUME,
  MIN_BPM,
  MIN_VOLUME,
} from "utils/constants";
import { BPM, Seconds, Volume } from "../units";
import { isBoolean, isPlainObject, isString } from "lodash";
import { WholeNoteTicks } from "utils/durations";
import { isBoundedNumber } from "types/util";

/** The `Transport` contains information about playback and the Tone.js Transport. */
export interface Transport {
  state: PlaybackState;
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
  state: "stopped",
  bpm: DEFAULT_BPM,
  loop: false,
  loopStart: 0,
  loopEnd: WholeNoteTicks - 1,
  volume: -6,
  mute: false,
  timeSignature: [16, 16],
  recording: false,
  downloading: false,
};

/** Checks if a given object is of type `Transport`. */
export const isTransport = (obj: unknown): obj is Transport => {
  const candidate = obj as Transport;
  return (
    isPlainObject(candidate) &&
    isString(candidate.state) &&
    ["started", "stopped", "paused"].includes(candidate.state) &&
    isBoundedNumber(candidate.bpm, MIN_BPM, MAX_BPM) &&
    isBoolean(candidate.loop) &&
    isBoundedNumber(candidate.loopStart, 0) &&
    isBoundedNumber(candidate.loopEnd, 0) &&
    candidate.loopStart < candidate.loopEnd &&
    isBoundedNumber(candidate.volume, MIN_VOLUME, MAX_VOLUME)
  );
};
