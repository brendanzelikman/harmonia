import { nanoid } from "@reduxjs/toolkit";
import { durationToTicks, mod } from "utils";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import { Note, Pitch, XML } from "./units";
import { getScaleKey } from "./key";
import { DemoXML } from "assets/demoXML";

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

export const chromaticScale: Scale = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
};
export const testScale = (notes: Note[]) => {
  return {
    id: "test-scale",
    name: "Test Scale",
    notes,
  };
};

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

  static exportToXML(scale: Scale): XML {
    if (!scale || !scale.notes.length) return DemoXML;

    const key = getScaleKey(scale);
    const xmlNotes = scale.notes.map((note) => {
      return MusicXML.createNote(note, {
        type: "quarter",
        duration: durationToTicks("quarter"),
        voice: 1,
        staff: note >= 60 ? 1 : 2,
        key,
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

  // Returns true if the two scales are exactly equal
  static areEqual = (scale1: Scale, scale2: Scale) => {
    if (scale1.notes.length !== scale2.notes.length) return false;
    for (let i = 0; i < scale1.notes.length; i++) {
      if (scale1.notes[i] % 12 !== scale2.notes[i] % 12) return false;
    }
    return true;
  };

  // Returns true if the two scales are related by transposition
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

  // Returns true if the two scales are related by rotation
  static areModes = (scale1: Scale, scale2: Scale) => {
    for (let i = 0; i < scale1.notes.length; i++) {
      const mode = rotateScale(scale1, i);
      const isEqual = Scales.areEqual(mode, scale2);
      if (isEqual) return true;
    }
    return false;
  };
}
export const defaultScale = {
  id: "default-scale",
  name: Scales.TrackScaleName,
  notes: chromaticScale.notes,
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
  notes: scale.notes.map((note) => note + offset),
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
