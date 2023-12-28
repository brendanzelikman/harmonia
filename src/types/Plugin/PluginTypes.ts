import { TrackId } from "types/Track";
import { BPM, MIDI, Samples, Velocity } from "types/units";

type NoteOn = 1;
type NoteOff = 0;

export type PluginNote = {
  number: MIDI;
  velocity: Velocity;
  duration: Samples;
  event: NoteOn | NoteOff;
};

export type PluginChordMap = Record<Samples, PluginNote[]>;

export type PluginData = {
  bpm: BPM;
  port: number;
  chordMap: PluginChordMap;
};

export type PluginDataMap = Record<TrackId, PluginData>;
