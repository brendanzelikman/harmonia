import { nanoid } from "@reduxjs/toolkit";
import { getPresetPatternByString } from "lib/presets/patterns";
import { promptLineBreak } from "components/PromptModal";
import {
  createUndoType,
  Payload,
  unpackData,
  unpackUndoType,
} from "types/redux";
import { trim, clamp } from "lodash";
import {
  updatePattern,
  updatePatternBlock,
  updatePatternNote,
} from "types/Pattern/PatternSlice";
import { Thunk } from "types/Project/ProjectTypes";
import {
  autoBindNoteToTrack,
  autoBindStreamToTrack,
} from "types/Track/TrackUtils";
import { promptUserForNumber, promptUserForString } from "lib/prompts/html";
import { promptUserForFile } from "lib/prompts/html";
import { readPatternStreamFromString } from "lib/prompts/pattern";
import { selectPatternClipById } from "types/Clip/ClipSelectors";
import { PatternClipId } from "types/Clip/PatternClip/PatternClipTypes";
import { Midi } from "@tonejs/midi";
import {
  isPatternRest,
  PatternId,
  PatternMidiBlock,
  PatternNestedNote,
  PatternStream,
} from "types/Pattern/PatternTypes";
import {
  addMidiNoteToBlock,
  getPatternBlockNotes,
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
} from "utils/duration";
import {
  getPatternBlockAtIndex,
  getPatternBlockDuration,
} from "types/Pattern/PatternFunctions";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { resolvePatternStreamToMidi } from "types/Pattern/PatternResolvers";
import {
  TRANSFORMATION_CATEGORIES,
  getCategoryTransformations,
  TRANSFORMATIONS,
  TRANSFORMATION_TYPES,
} from "types/Pattern/PatternTransformers";
import {
  selectScaleTrackByScaleId,
  selectTrackById,
  selectTrackByLabel,
  selectTrackScaleChain,
} from "types/Track/TrackSelectors";
import { interpretAudioBuffer } from "utils/buffer";
import { promptUserForMicrophone } from "lib/prompts/html";
import { Note } from "@tonejs/midi/dist/Note";
import { dispatchOpen } from "hooks/useToggle";
import { TrackId } from "types/Track/TrackTypes";
import { resolveScaleNoteToMidi } from "types/Scale/ScaleResolvers";
import { isNestedNote } from "types/Scale/ScaleTypes";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { DEFAULT_VELOCITY } from "utils/constants";
import { getEventFile } from "utils/event";
import { isString } from "types/utils";

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
            const file = getEventFile(e);
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
          const file = await promptUserForMicrophone("record-pattern");
          const notes = await interpretAudioBuffer(await file.arrayBuffer());
          return dispatch(promptUserForPatternMidiFile(id, notes));
        }

        const shouldUploadWav = string === "wav";
        if (shouldUploadWav) {
          return promptUserForFile("audio/*", async (e) => {
            const file = getEventFile(e);
            if (!file) return;
            const notes = await interpretAudioBuffer(await file.arrayBuffer());
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
          if (index !== undefined) {
            stream = [...patternStream].toSpliced(index, 0, ...stream);
          } else {
            stream = [...patternStream, ...stream];
          }
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
        chords.filter((c) => Array.isArray(c))
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
export const bindNoteWithPrompt =
  (
    payload: Payload<{ id: PatternId; trackId?: TrackId; index: number }>
  ): Thunk =>
  (dispatch) => {
    const { id, trackId, index } = unpackData(payload);
    promptUserForString({
      title: "Input Scale Note",
      large: true,
      description: [
        promptLineBreak,
        <span>Rule #1: Scale Notes are specified by label and number.</span>,
        <span>Example: B1 = Degree 1 of Scale B </span>,
        promptLineBreak,
        <span>Rule #2: Scale Offsets are summed after Scale Notes.</span>,
        <span>
          Example: B2 + A-1 = Degree 2 of Scale B, 1 step down Scale A
        </span>,
        promptLineBreak,
        <span>Rule #3: Pedal tones are specified with "pedal"</span>,
        <span>Rule #4: Default bindings are specified with "auto"</span>,
        promptLineBreak,
        <span className="underline">Please input your note:</span>,
      ],
      callback: (string) => {
        dispatch(
          bindNoteWithPromptCallback({ data: { string, id, trackId, index } })
        );
      },
    })();
  };
export const bindNoteWithPromptCallback =
  (
    payload: Payload<{
      string: string;
      id: PatternId;
      trackId?: TrackId;
      index: number;
    }>
  ): Thunk =>
  async (dispatch, getProject) => {
    const { string, id, trackId, index } = unpackData(payload);
    const project = getProject();
    const undoType = unpackUndoType(payload, "bindNoteWithPrompt");
    const pattern = selectPatternById(project, id);
    const { stream } = pattern;
    const track = trackId ? selectTrackById(project, trackId) : undefined;
    const block = getPatternBlockAtIndex(stream, index);
    const blockNotes = getPatternBlockNotes(block);
    let noteIndex = 0;
    if (blockNotes.length > 1) {
      await promptUserForNumber(
        "Select Note",
        "Please input the index of the note to bind:",
        (input) => (noteIndex = input)
      )();
    }
    if (string === "auto" && track) {
      const block = getPatternBlockWithNewNotes(stream[index], (notes) =>
        notes.map((note, i) => {
          if (i !== noteIndex) return note;
          return dispatch(autoBindNoteToTrack(trackId, note));
        })
      );
      dispatch(updatePatternBlock({ data: { id, index, block }, undoType }));
      return;
    } else if (string === "pedal") {
      const block = getPatternBlockWithNewNotes(
        pattern.stream[index],
        (notes) =>
          notes.map((note, i) => {
            if (i !== noteIndex) return note;
            const { duration, velocity } = note;
            const newNote = { ...note };
            const scaleId = "scaleId" in note ? note.scaleId : undefined;
            const trackId = selectScaleTrackByScaleId(project, scaleId)?.id;
            const chain = trackId
              ? selectTrackScaleChain(project, trackId)
              : [];
            if (isNestedNote(newNote) && "MIDI" in newNote) delete newNote.MIDI;
            const MIDI = resolveScaleNoteToMidi(newNote, chain);
            return { duration, velocity, MIDI };
          })
      );
      dispatch(
        updatePatternBlock({
          data: { id, index, block },
          undoType,
        })
      );
      return;
    } else {
      const newBlock = getPatternBlockWithNewNotes(block, (notes) =>
        notes.map((n, i) => {
          if (!n || i !== noteIndex) return n;
          const firstNote = { ...n } as PatternNestedNote;
          const regex = /([a-zA-Z])([-+]?\d+)/g;
          const [note, ...offsets] = [...string.matchAll(regex)].map(
            (match, i) => {
              const label = match[1];
              const number = parseInt(match[2]);
              if (i === 0)
                return { label, value: number === 0 ? 0 : number - 1 };
              return { label, value: number };
            }
          );

          if (isPatternRest(block)) {
            firstNote.duration = block.duration;
            firstNote.velocity = DEFAULT_VELOCITY;
          }
          const baseTrack = selectTrackByLabel(getProject(), note.label);
          if (!baseTrack) return firstNote;
          firstNote.scaleId = (baseTrack as ScaleTrack)?.scaleId;
          if ("scaleId" in firstNote && "MIDI" in firstNote) {
            delete firstNote.MIDI;
          }
          firstNote.degree = note.value;
          firstNote.offset = { octave: firstNote.offset?.octave ?? 0 };
          for (const offset of offsets) {
            if (offset.label === "t") {
              if (!firstNote.offset.chromatic) {
                firstNote.offset.chromatic = 0;
              }
              firstNote.offset.chromatic += offset.value;
              continue;
            }
            const offsetTrack = selectTrackByLabel(getProject(), offset.label);
            if (!offsetTrack) return firstNote;
            const scaleId = (offsetTrack as ScaleTrack).scaleId;
            firstNote.offset[scaleId] = offset.value;
          }
          if (isNestedNote(firstNote) && !firstNote.scaleId) {
            firstNote.offset = {
              ...firstNote.offset,
              octave:
                (firstNote.offset?.octave ?? 0) + Math.floor(note.value / 12),
            };
          }
          return firstNote;
        })
      );
      dispatch(updatePatternBlock({ data: { id, index, block: newBlock } }));
    }
  };
