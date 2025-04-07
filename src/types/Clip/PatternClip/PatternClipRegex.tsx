import { nanoid } from "@reduxjs/toolkit";
import { getPresetPatternByString } from "assets/patterns";
import { promptLineBreak } from "components/PromptModal";
import { createUndoType } from "lib/redux";
import { trim, isString, clamp, isArray } from "lodash";
import { updatePattern } from "types/Pattern/PatternSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { autoBindStreamToTrack } from "types/Track/TrackUtils";
import { promptUserForFile, promptUserForString } from "utils/html";
import { readPatternStreamFromString } from "utils/pattern";
import { selectPatternClipById } from "../ClipSelectors";
import { PatternClipId } from "./PatternClipTypes";
import { Midi } from "@tonejs/midi";
import {
  isPatternRest,
  PatternMidiBlock,
  PatternStream,
} from "types/Pattern/PatternTypes";
import {
  addMidiNoteToBlock,
  getPatternBlockWithNewNotes,
  getPatternChordNotes,
  getPatternMidiBlockWithNewNotes,
  getPatternStreamWithNewNotes,
} from "types/Pattern/PatternUtils";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import {
  secondsToTicks,
  getClosestDuration,
  WholeNoteTicks,
  createEighthNote,
} from "utils/durations";
import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { insert } from "utils/array";
import { resolvePatternStreamToMidi } from "types/Pattern/PatternResolvers";
import {
  TRANSFORMATION_CATEGORIES,
  getCategoryTransformations,
  TRANSFORMATIONS,
  TRANSFORMATION_TYPES,
} from "types/Pattern/PatternTransformers";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { analyzeAudio, recordWav } from "utils/wav-to-midi";
import { Note } from "@tonejs/midi/dist/Note";
import { dispatchOpen } from "hooks/useToggle";

// -------------------------------------------------------
//  Pattern Clip Upload
// -------------------------------------------------------

/** Prompt the user to input a pattern string and add the notes to the pattern clip. */
export const promptUserForPattern =
  (id: PatternClipId, index?: number): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      title: "Input Pattern",
      description: [
        promptLineBreak,
        <span>
          {"Rule #1: "}
          <span className="text-teal-500">Notes</span>
          {` are inputted as `}
          {`pitches`}
          {` or `}
          {`{ pitch, duration, velocity }`}
        </span>,
        <span>
          {"Example: "}
          <span className="text-emerald-400/90">C4, E4, G4</span>
          {` or `}
          <span className="text-emerald-400/90">{`{ C4, quarter }`}</span>
          {` or `}
          <span className="text-emerald-400/90">{`{ C4, half-dotted, 127 }`}</span>
        </span>,
        promptLineBreak,
        <span>
          {"Rule #2: "}
          <span className="text-teal-500">Chords</span>{" "}
          {`are inputted with square brackets`}
        </span>,
        <span>
          {"Example: "}
          <span className="text-emerald-400/90">{`[C4, E4, G4]`}</span>
          {` or `}
          <span className="text-emerald-400/90">{`[ {C4, eighth}, {C5, eighth, 127} ]`}</span>
        </span>,
        promptLineBreak,
        <span>
          {"Rule #3: "}
          <span className="text-teal-500">Rests</span>
          {` are inputted as `}
          {`durations`}
          {` or `}
          {`{ duration }`}
        </span>,
        <span>
          {"Example: "}
          <span className="text-emerald-400/90">quarter</span>
          {` or `}
          <span className="text-emerald-400/90">16th-triplet</span>
          {` or `}
          <span className="text-emerald-400/90">{`{ whole }`}</span>
        </span>,
        promptLineBreak,
        <span>
          {"Rule #4: "}
          <span className="text-teal-500">Patterns</span>
          {` can be described in plain English `}
        </span>,
        <span>
          {"Example: "}
          <span className="text-emerald-400/90">{`major chord`}</span>
          {` or `}
          <span className="text-emerald-400/90">{`tresillo`}</span>
          {` or `}
          <span className="text-emerald-400/90">{`minor 11th arpeggio`}</span>
        </span>,
        promptLineBreak,
        `Rule #5: You can import from file (with "midi" or "wav")`,
        `Rule #6: You can record with your microphone (with "record")`,
        promptLineBreak,
        `Please input your request:`,
      ],
      callback: async (string) => {
        if (!trim(string).length) return;
        const project = getProject();
        const undoType = createUndoType("importPattern", nanoid());
        const clip = selectPatternClipById(project, id);
        if (!clip) return;
        const { patternId, trackId } = clip;

        // Handle MIDI file uploads
        const shouldUploadMidi = string === "midi";
        if (shouldUploadMidi) {
          return promptUserForFile(".mid", async (e) => {
            const file = (e.target as HTMLInputElement)?.files?.[0];
            if (!file) return;
            const buffer = await file.arrayBuffer();
            const midi = new Midi(buffer);
            const firstTrack = midi.tracks[0];
            if (!firstTrack) return;
            dispatch(promptUserForPatternMidiFile(id, firstTrack.notes));
          });
        }

        // Handle WAV file uploads
        const shouldRecord = string === "record";
        if (shouldRecord) {
          dispatchOpen("record-pattern");
          const file = await recordWav();
          const notes = await analyzeAudio(file);
          return dispatch(promptUserForPatternMidiFile(id, notes));
        }

        const shouldUploadWav = string === "wav";
        if (shouldUploadWav) {
          return promptUserForFile("audio/*", async (e) => {
            const file = (e.target as HTMLInputElement)?.files?.[0];
            if (!file) return;
            const notes = await analyzeAudio(file);
            return dispatch(promptUserForPatternMidiFile(id, notes));
          });
        }

        // Try to match the name with a preset pattern
        let pattern = getPresetPatternByString(string);

        // If the input ends with "arpeggio", search for presets without it
        if (!pattern) {
          const ending = " arpeggio";
          if (string.endsWith(ending)) string = string.slice(0, -ending.length);
          const preset = getPresetPatternByString(string);
          if (preset) {
            pattern = { ...preset };
            pattern.stream = [...preset.stream.flat()];
            pattern.stream = [
              ...pattern.stream,
              ...pattern.stream.slice(1, -1).toReversed(),
            ];
            const duration = Math.round(WholeNoteTicks / pattern.stream.length);
            for (let i = 0; i < pattern.stream.length; i++) {
              pattern.stream[i] = getPatternBlockWithNewNotes(
                pattern.stream[i],
                (notes) => notes.map((note) => ({ ...note, duration })),
                () => ({ duration })
              );
            }
          }
        }

        // Use a stream if it was found or parse the input string
        let stream = pattern?.stream ?? readPatternStreamFromString(string);
        const newStream: PatternStream = [];
        for (let i = 0; i < stream.length; i++) {
          const block = stream[i];
          if (isPatternRest(block)) {
            newStream.push(block);
            continue;
          }
          const chord = getPatternChordNotes(block);
          if (chord.length > 1) {
            newStream.push(block);
            continue;
          }
          const note = chord[0];
          if ("query" in note && isString(note.query)) {
            const match = getPresetPatternByString(note.query);
            if (!match) continue;
            const stream = getPatternStreamWithNewNotes(
              match.stream,
              (notes) =>
                notes.map((n) => ({
                  ...n,
                  duration: note.duration,
                  velocity: note.velocity,
                })),
              () => ({ duration: note.duration })
            );
            newStream.push(...stream);
            continue;
          }
          newStream.push(block);
        }

        // If the input is just a number, add the MIDI note
        const note = parseInt(string);
        if (!newStream.length && !isNaN(note)) {
          newStream.push(createEighthNote(note));
        }

        // Bind the stream to the track
        stream = dispatch(autoBindStreamToTrack(trackId, newStream));

        // Append or splice the stream to the pattern
        const patternStream = selectPatternById(project, patternId).stream;
        if (patternStream) {
          stream = insert(patternStream, stream, index);
        }
        dispatch(updatePattern({ data: { id: patternId, stream }, undoType }));
      },
      large: true,
    })();

// -------------------------------------------------------
//  Pattern MIDI File Upload
// -------------------------------------------------------

/** Prompt the user to upload a MIDI file and update the pattern clip. */
export const promptUserForPatternMidiFile =
  (id: PatternClipId, notes: Note[]): Thunk =>
  async (dispatch, getProject) => {
    const project = getProject();
    const bpm = selectTransportBPM(project);
    const clip = selectPatternClipById(project, id);
    if (!clip) return;

    // Convert to the native format
    const midiNotes = notes
      .map((note) => ({
        MIDI: note.midi,
        duration: note.duration,
        velocity: Math.round(note.velocity * 127),
        time: note.time,
      }))
      .sort((a, b) => a.time - b.time);

    // Group notes into chords by time
    const blocks = midiNotes.reduce((acc, note) => {
      const last = acc[acc.length - 1];

      // Push the first note normally
      if (!last) {
        acc.push({ time: note.time, block: [note], duration: note.duration });
        return acc;
      }

      // If the last note has the same time, push this note to it as a chord
      if (Math.abs(last.time - note.time) < 1e-2) {
        last.block = addMidiNoteToBlock(last.block, note);
        return acc;
      }

      // If there is a gap, add a rest before the note
      const lastEnd = last.time + last.duration;
      if (lastEnd < note.time) {
        const duration = note.time - lastEnd;
        acc.push({ time: lastEnd, block: { duration }, duration });
      }

      // Push the note as a new chord
      acc.push({ time: note.time, block: [note], duration: note.duration });
      return acc;
    }, [] as { time: number; block: PatternMidiBlock; duration: number }[]);

    // Cut off times and quantize durations to the best match
    const chords = blocks.map(({ time, block }, i) => {
      let duration = getPatternBlockDuration(block);

      // If there is a note after, clamp the duration
      const nextChord = blocks[i + 1];
      if (nextChord) {
        duration = clamp(duration, 0, nextChord.time - time);
      }
      duration = Math.max(0, duration);

      // Convert the duration to ticks and quantize if necessary
      const ticks = secondsToTicks(duration, bpm);
      duration = getClosestDuration(ticks);
      return getPatternMidiBlockWithNewNotes(block, (notes) =>
        notes.map(
          ({ MIDI, velocity }) => ({ MIDI, velocity, duration }),
          () => ({ duration })
        )
      );
    });

    // Autobind the stream to the track
    const stream = dispatch(
      autoBindStreamToTrack(
        clip.trackId,
        chords.filter((c) => isArray(c))
      )
    );

    // Update the pattern with the new stream
    dispatch(updatePattern({ data: { id: clip.patternId, stream } }));
  };

// -------------------------------------------------------
//  Pattern Clip Effect
// -------------------------------------------------------

/** Add a new effect to the pattern clip. */
export const promptUserForPatternEffect =
  (id: PatternClipId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      title: "Apply Pattern Effect",
      description: [
        "Available Transformations",
        promptLineBreak,
        ...TRANSFORMATION_CATEGORIES.flatMap((c) => [
          <div key={c}>
            <div className="capitalize -mt-2 text-indigo-400">{c}</div>
            {getCategoryTransformations(c).map((t) => (
              <div key={t.id}>
                <span className=" text-indigo-300">- {t.id}</span>
                <span>{` ${TRANSFORMATIONS[t.id].description ?? ""}`}</span>
              </div>
            ))}
            {promptLineBreak}
          </div>,
          ,
        ]),
      ],
      callback: (string) => {
        if (!string) return;
        const project = getProject();
        const clip = selectPatternClipById(project, id);
        if (!clip) return;
        const pattern = selectPatternById(project, clip.patternId);
        if (!pattern) return;
        const chain = selectTrackScaleChain(project, clip.trackId);
        const transformations = TRANSFORMATION_TYPES;
        const t = transformations.find((t) => string.startsWith(t));
        if (!t) return;
        const args = string.slice(t.length).trim();
        const callback = TRANSFORMATIONS[t].callback;
        const midiStream = resolvePatternStreamToMidi(pattern.stream, chain);
        const stream = callback(midiStream, args);
        dispatch(updatePattern({ data: { id: clip.patternId, stream } }));
      },
    })();
