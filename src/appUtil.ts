import { MAX_SUBDIVISION } from "appConstants";
import { MIDI } from "types/midi";
import { Duration, Note, Pitch } from "types/units";

export const isInputEvent = (e: Event) =>
  (e.target as HTMLElement).tagName === "INPUT";

export const blurOnEnter = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
  }
};

export const mod = (n: number, m: number) => ((n % m) + m) % m;

// Closest number in array
export const closest = (goal: number, arr: number[]) =>
  arr.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });

// Convert note duration to number of beats
export const durationToBeats = (duration: Duration) => {
  switch (duration) {
    case "whole":
      return MAX_SUBDIVISION;
    case "half":
      return MAX_SUBDIVISION / 2;
    case "quarter":
      return MAX_SUBDIVISION / 4;
    case "eighth":
      return MAX_SUBDIVISION / 8;
    case "16th":
      return MAX_SUBDIVISION / 16;
    case "32nd":
      return MAX_SUBDIVISION / 32;
    default:
      return 0;
  }
};

// Convert number of beats to note duration
export const beatsToDuration = (beats: number) => {
  switch (beats) {
    case MAX_SUBDIVISION:
      return "whole";
    case MAX_SUBDIVISION / 2:
      return "half";
    case MAX_SUBDIVISION / 4:
      return "quarter";
    case MAX_SUBDIVISION / 8:
      return "eighth";
    case MAX_SUBDIVISION / 16:
      return "16th";
    case MAX_SUBDIVISION / 32:
      return "32nd";
    default:
      return "quarter";
  }
};

// Convert beats to Tone.js subdivision
export const beatsToSubdivision = (beats: number) => {
  switch (beats) {
    case MAX_SUBDIVISION:
      return "1n";
    case MAX_SUBDIVISION / 2:
      return "2n";
    case MAX_SUBDIVISION / 4:
      return "4n";
    case MAX_SUBDIVISION / 8:
      return "8n";
    case MAX_SUBDIVISION / 16:
      return "16n";
    case MAX_SUBDIVISION / 32:
      return "32n";
    default:
      return "4n";
  }
};

// Closest pitch class in array of MIDI notes
export const closestPitchClass = (
  pitch: Pitch,
  arr: Note[]
): Pitch | undefined => {
  if (!arr.length) return;
  const notes = arr.map((n) => MIDI.ChromaticNumber(n));
  const note = MIDI.ChromaticNotes.indexOf(pitch);

  // Get the closest chromatic number
  const index = notes.reduce((prev, curr) => {
    const currDiff = Math.abs(curr - note);
    const prevDiff = Math.abs(prev - note);
    return currDiff <= prevDiff ? curr : prev;
  });

  // Return the closest pitch class
  return MIDI.ChromaticNotes[index];
};
