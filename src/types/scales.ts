import { nanoid } from "@reduxjs/toolkit";
import { durationToTicks, mod } from "utils";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import { PresetScales } from "./presets/scales";
import { Note, Pitch, XML } from "./units";

export type ScaleId = string;

// A scale is a collection of notes that serves as a key for a track.
// A scale can have a parent, which defines the container for transposition
export interface Scale {
  id: ScaleId;
  name: string;
  notes: Note[];
}
export const isScale = (obj: any): obj is Scale => {
  const { id, name, notes } = obj;
  return id !== undefined && name !== undefined && notes !== undefined;
};

export type ScaleNoId = Omit<Scale, "id">;

// The Scales class contains methods for preset scales and MusicXML serialization
export default class Scales {
  public static TrackScaleName = "$$$$$_track_scale_$$$$$";

  public static Pitches(scale: Scale) {
    return scale.notes.map((note) => MIDI.toPitchClass(note));
  }
  public static SortPitches(pitches: Pitch[]) {
    return pitches.sort(
      (a, b) => MIDI.ChromaticNumber(a) - MIDI.ChromaticNumber(b)
    );
  }

  static exportToXML(notes: Note[]): XML {
    const xmlNotes = notes.map((note) => {
      return MusicXML.createNote(note, {
        type: "quarter",
        duration: durationToTicks("quarter"),
        voice: 1,
        staff: note >= 60 ? 1 : 2,
      });
    });
    // Create measure
    const measure = MusicXML.createMeasure(xmlNotes);

    // Create part
    const id = `scale`;
    const part = MusicXML.createPart(id, [measure]);
    const scorePart = MusicXML.createScorePart(id);
    const partList = MusicXML.createPartList([scorePart]);

    // Create score
    const score = MusicXML.createScore(partList, [part]);

    // Return the XML
    return MusicXML.serialize(score);
  }

  static BasicScales = [
    PresetScales.ChromaticScale,
    PresetScales.MajorScale,
    PresetScales.MinorScale,
    PresetScales.HarmonicMinorScale,
    PresetScales.MelodicMinorScale,
  ];

  static BasicModes = [
    PresetScales.LydianScale,
    PresetScales.IonianScale,
    PresetScales.MixolydianScale,
    PresetScales.DorianScale,
    PresetScales.AeolianScale,
    PresetScales.PhrygianScale,
    PresetScales.LocrianScale,
  ];

  static PentatonicScales = [
    PresetScales.MajorPentatonicScale,
    PresetScales.MinorPentatonicScale,
    PresetScales.YoScale,
    PresetScales.InScale,
    PresetScales.HirajoshiScale,
    PresetScales.IwatoScale,
    PresetScales.InsenScale,
  ];

  static HexatonicScales = [
    PresetScales.MajorHexatonicScale,
    PresetScales.MinorHexatonicScale,
    PresetScales.BluesScale,
    PresetScales.AugmentedScale,
    PresetScales.PrometheusScale,
    PresetScales.TritoneScale,
    PresetScales.WholeToneScale,
  ];

  static OctatonicScales = [
    PresetScales.BebopMajorScale,
    PresetScales.BebopDorianScale,
    PresetScales.BebopHarmonicMinorScale,
    PresetScales.BebopMelodicMinorScale,
    PresetScales.BebopDominantScale,
    PresetScales.OctatonicWHScale,
    PresetScales.OctatonicHWScale,
  ];

  static UncommonScales = [
    PresetScales.AlteredScale,
    PresetScales.AcousticScale,
    PresetScales.HarmonicMajorScale,
    PresetScales.PersianScale,
    PresetScales.ByzantineScale,
    PresetScales.HungarianMinorScale,
    PresetScales.HungarianMajorScale,
    PresetScales.NeapolitanMinorScale,
    PresetScales.NeapolitanMajorScale,
  ];

  static CustomScales = [] as Scale[];

  static PresetGroups = {
    "Custom Scales": Scales.CustomScales,
    "Basic Scales": Scales.BasicScales,
    "Basic Modes": Scales.BasicModes,
    "Pentatonic Scales": Scales.PentatonicScales,
    "Hexatonic Scales": Scales.HexatonicScales,
    "Octatonic Scales": Scales.OctatonicScales,
    "Uncommon Scales": Scales.UncommonScales,
  };

  static PresetCategories = Object.keys(
    Scales.PresetGroups
  ) as (keyof typeof Scales.PresetGroups)[];

  static Presets = [
    ...Scales.CustomScales,
    ...Scales.BasicScales,
    ...Scales.BasicModes,
    ...Scales.PentatonicScales,
    ...Scales.HexatonicScales,
    ...Scales.OctatonicScales,
    ...Scales.UncommonScales,
  ];

  static areEqual = (scale1: Scale, scale2: Scale) => {
    if (scale1.notes.length !== scale2.notes.length) return false;
    for (let i = 0; i < scale1.notes.length; i++) {
      if (scale1.notes[i] !== scale2.notes[i]) return false;
    }
    return true;
  };

  static areRelated = (scale1: Scale, scale2: Scale) => {
    if (scale1.notes.length !== scale2.notes.length) return false;
    const length = scale1.notes.length;

    return new Array(length).fill(0).some((_) => {
      for (let i = 0; i < scale1.notes.length; i++) {
        // Get the distance between the two scales
        const offset = scale2.notes[0] - scale1.notes[0];
        // Check if the distance is the same for all notes
        for (let i = 0; i < scale1.notes.length; i++) {
          if (scale1.notes[i] + offset !== scale2.notes[i]) return false;
        }
        return true;
      }
    });
  };
}

export const defaultScale = {
  id: "scale-1",
  name: Scales.TrackScaleName,
  notes: PresetScales.ChromaticScale.notes,
};

export const initializeScale = (
  scale: Partial<ScaleNoId> = defaultScale
): Scale => ({
  ...defaultScale,
  ...scale,
  id: nanoid(),
});

export const transposeScale = (scale: Scale, offset: number): Scale => ({
  ...scale,
  notes: scale.notes.map((note) => Number(note) + Number(offset)),
});

export const rotateScale = (scale: Scale, offset: number): Scale => {
  const length = Math.abs(offset);
  const step = offset > 0 ? 1 : -1;
  const modulus = scale.notes.length;

  return {
    ...scale,
    notes: scale.notes.map((_, i) => {
      let newIndex = i;
      let offset = 0;
      for (let j = 0; j < length; j++) {
        const nextIndex = mod(newIndex + step, modulus);
        if (step > 0 && nextIndex <= newIndex) offset += 12;
        if (step < 0 && nextIndex >= newIndex) offset -= 12;
        newIndex = nextIndex;
      }
      return scale.notes[newIndex] + offset;
    }),
  };
};
