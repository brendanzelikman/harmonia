import { TrackId } from "types/Track/TrackTypes";
import { BPM, Samples, Velocity } from "types/units";
import { MidiNote } from "utils/midi";

type NoteOn = 1;
type NoteOff = 0;

export type PluginNote = {
  number: MidiNote;
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
