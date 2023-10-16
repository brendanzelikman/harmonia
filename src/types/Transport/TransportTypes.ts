import { PlaybackState } from "tone";
import { DEFAULT_BPM } from "utils/constants";
import { MIDI } from "../midi";
import { Tick, BPM, Time, Volume } from "../units";

/**
 * The `Transport` contains information about playback and the Tone.js Transport.
 *
 * @property `state` - The current playback state, e.g. "started".
 * @property `bpm` - The current beats per minute.
 * @property `timeSignature` - The time signature of the transport.
 * @property `loop` - Whether the transport is looping.
 * @property `loopStart` - The start of the loop in ticks.
 * @property `loopEnd` - The end of the loop in ticks.
 * @property `volume` - The volume of the transport.
 * @property `mute` - Whether the transport is muted.
 * @property `recording` - Whether the transport is recording.
 * @property `downloading` - Whether the transport is downloading.
 *
 */
export interface Transport {
  state: PlaybackState;
  bpm: BPM;
  timeSignature: [number, number];

  loop: boolean;
  loopStart: Time;
  loopEnd: Time;

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
  loopEnd: MIDI.WholeNoteTicks - 1,
  volume: -6,
  mute: false,
  timeSignature: [16, 16],
  recording: false,
  downloading: false,
};

/**
 * Checks if a given object is of type `Transport`.
 * @param obj The object to check.
 * @returns True if the object is a `Transport`, otherwise false.
 */
export const isTransport = (obj: unknown): obj is Transport => {
  const candidate = obj as Transport;
  return (
    candidate?.state !== undefined &&
    candidate?.bpm !== undefined &&
    candidate?.loop !== undefined &&
    candidate?.loopStart !== undefined &&
    candidate?.loopEnd !== undefined &&
    candidate?.volume !== undefined &&
    candidate?.timeSignature !== undefined
  );
};
