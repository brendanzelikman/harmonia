import { DEFAULT_BPM } from "appConstants";
import { PlaybackState } from "tone";
import { MIDI } from "./midi";
import { Tick, BPM, Time, Volume } from "./units";

export interface Transport {
  tick: Tick; // Current time in ticks
  state: PlaybackState;
  bpm: BPM;
  loop: boolean;
  loopStart: Time;
  loopEnd: Time;
  volume: Volume;
  mute: boolean;
  timeSignature: [number, number];
  loaded: boolean;
  loading: boolean;
  recording: boolean;
  offlineTick: Tick;
}

export const defaultTransport: Transport = {
  tick: 0,
  state: "stopped",
  bpm: DEFAULT_BPM,
  loop: false,
  loopStart: 0,
  loopEnd: MIDI.WholeNoteTicks - 1,
  volume: -6,
  mute: false,
  timeSignature: [16, 16],
  loaded: false,
  loading: false,
  recording: false,
  offlineTick: 0,
};

export const isTransport = (obj: any): obj is Transport => {
  const { tick, state, bpm, loop, loopStart, loopEnd, volume, timeSignature } =
    obj;
  return (
    tick !== undefined &&
    state !== undefined &&
    bpm !== undefined &&
    loop !== undefined &&
    loopStart !== undefined &&
    loopEnd !== undefined &&
    volume !== undefined &&
    timeSignature !== undefined
  );
};
