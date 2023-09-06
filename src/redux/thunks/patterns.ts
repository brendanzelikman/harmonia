import { ticksToToneSubdivision } from "utils";
import {
  selectPattern,
  selectPatternTrack,
  selectRoot,
  selectTransport,
} from "redux/selectors";
import { createClip } from "redux/slices/clips";

import { AppThunk } from "redux/store";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import {
  PatternId,
  PatternStream,
  realizePattern,
  transposePatternStream,
} from "types/patterns";
import { defaultScale } from "types/scales";
import { Midi } from "@tonejs/midi";
import { createPattern, updatePattern } from "redux/slices/patterns";
import { convertTicksToSeconds } from "redux/slices/transport";
import { PresetPatternList } from "types/presets/patterns";

// Start reading files from the file system
export const readMIDIFiles = (): AppThunk => (dispatch, getState) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".mid";
  input.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      dispatch(createPatternsFromMIDI(file));
    }
  });
  input.click();
};

export const playPattern =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pattern = selectPattern(state, id);

    if (!pattern) return;

    const sampler = getGlobalSampler();
    if (!sampler?.loaded) return;

    const transport = selectTransport(state);
    const stream = realizePattern(pattern, defaultScale);
    if (!stream.length) return;

    let time = 0;
    for (let i = 0; i < stream.length; i++) {
      const chord = stream[i];
      if (!chord.length) continue;
      const firstNote = chord[0];
      const seconds = convertTicksToSeconds(transport, firstNote.duration);
      const subdivision = ticksToToneSubdivision(firstNote.duration);
      if (MIDI.isRest(firstNote)) {
        time += seconds;
        continue;
      }
      const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));
      setTimeout(() => {
        if (!sampler?.loaded) return;
        sampler.triggerAttackRelease(pitches, subdivision);
      }, time * 1000);
      time += seconds;
    }
  };

export const parsePatternRegex = (expression: string) => {
  const pitchClassRegex = `([A-Ga-g][#|b]?)?`;

  const matches = PresetPatternList.filter((pattern) => {
    const phrases = [pattern.id, ...(pattern.aliases || [])];
    const safePhrases = phrases.map((phrase) => phrase.replace("+", "\\+"));
    const optionsRegex = safePhrases.join("|");
    const regex = new RegExp(`^${pitchClassRegex} ?(${optionsRegex})$`);
    return regex.test(expression);
  });

  if (!matches.length) return;

  let newStream: PatternStream = [];
  for (const match of [matches[0]]) {
    const phrases = [match.id, ...(match.aliases || [])];
    const safePhrases = phrases.map((phrase) => phrase.replace("+", "\\+"));
    const optionsRegex = safePhrases.join("|");
    const regex = new RegExp(`^${pitchClassRegex} ?(${optionsRegex})$`);
    const result = regex.exec(expression);
    if (!result) continue;

    // Extract pitch class
    const pitchClass = (result[1] || "C").toUpperCase();
    const distanceFromC = MIDI.ChromaticNumber(pitchClass);

    // Extract transposed pattern
    const stream = transposePatternStream(match.stream, distanceFromC);
    newStream.push(...stream);
  }

  return newStream;
};

export const updatePatternByRegex =
  (id: PatternId, regex: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pattern = selectPattern(state, id);
    if (!pattern) return;

    const parsedStream = parsePatternRegex(regex);
    if (!parsedStream?.length) return;

    dispatch(
      updatePattern({
        id: pattern.id,
        stream: [...pattern.stream, ...parsedStream],
      })
    );
  };

export const addSelectedPatternToTimeline =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { tick } = selectTransport(state);

    const { selectedPatternId, selectedTrackId } = selectRoot(state);
    if (!selectedPatternId || !selectedTrackId) return;

    const pattern = selectPattern(state, selectedPatternId);
    if (!pattern) return;

    const track = selectPatternTrack(state, selectedTrackId);
    if (!track) return;

    dispatch(createClip({ patternId: pattern.id, trackId: track.id, tick }));
  };

// Create pattern from MIDI file
export const createPatternsFromMIDI =
  (file: File): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target?.result) return;
      const midi = new Midi(e.target.result as ArrayBuffer);
      const tracks = midi.tracks.map((track) => track.notes);

      tracks.forEach((track) => {
        const combinedNotes = track.reduce(
          (acc, note) => ({
            ...acc,
            [note.time]: {
              ...acc[note.time],
              midi: [...(acc[note.time]?.midi || []), note.midi],
              duration: note.duration ?? (acc[note.time]?.duration || 0),
              velocity:
                note.velocity ??
                (acc[note.time]?.velocity || MIDI.DefaultVelocity),
            },
          }),
          {} as Record<
            number,
            { midi: number[]; velocity: number; duration: number }
          >
        );
        const pattern = {
          name: file.name || "New Pattern",
          stream: Object.values(combinedNotes).map((note) =>
            note.midi.map((MIDI) => ({
              duration: convertTicksToSeconds(transport, note.duration),
              MIDI,
              velocity: note.velocity,
            }))
          ),
        };
        dispatch(createPattern(pattern));
      });
    };
    reader.readAsArrayBuffer(file);
  };

export const exportPatternToMIDI =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pattern = selectPattern(state, id);
    if (!pattern) return;

    // Prepare a new MIDI file
    const transport = selectTransport(state);
    const midi = new Midi();
    const track = midi.addTrack();
    const stream = pattern.stream;

    // Add stream and keep trakc of time
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < stream.length; i++) {
      const chord = stream[i];
      if (!chord.length) continue;

      // Get the first note in the chord and update time
      const firstNote = chord[0];
      const duration = convertTicksToSeconds(transport, firstNote.duration);
      time += duration;

      if (MIDI.isRest(firstNote)) continue;
      for (const note of chord) {
        track.addNote({
          midi: note.MIDI,
          duration,
          time: convertTicksToSeconds(transport, time),
          velocity: note.velocity ?? MIDI.DefaultVelocity,
        });
      }
    }
    // Create a MIDI blob
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);

    // Download the MIDI file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pattern.name || "pattern"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
