import {
  SixteenthNoteTicks,
  getStraightDuration,
  getTickDuration,
  getTickSubdivision,
} from "utils/durations";
import {
  selectDraftedPatternClip,
  selectPatternById,
  selectPatternTrackById,
  selectScaleTrackChain,
  selectTrackMidiScaleMap,
  selectTrackScaleChain,
  selectTransport,
} from "redux/selectors";
import { Thunk } from "types/Project";
import {
  Pattern,
  PatternId,
  PatternMidiChord,
  PatternNoId,
  PatternStream,
  defaultPattern,
  getPatternBlockDuration,
  getPatternChordNotes,
  getPatternMidiChordNotes,
  initializePattern,
  isPatternChord,
  isPatternMidiChord,
  isPatternMidiNote,
  isPatternStrummedChord,
  resolvePatternNoteToMidi,
  resolvePatternStreamToMidi,
  updatePatternChordNotes,
} from "types/Pattern";
import { Midi } from "@tonejs/midi";
import {
  addPattern,
  removePattern,
  selectPatternIds,
  updatePattern,
} from "redux/Pattern";
import { convertTicksToSeconds } from "types/Transport";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { updateMediaDraft } from "redux/Timeline";
import { DemoXML } from "assets/demoXML";
import {
  ScaleVector,
  getScaleAsArray,
  resolveScaleChainToMidi,
} from "types/Scale";
import { getScaleKey } from "utils/key";
import { MusicXML } from "lib/musicxml";
import { Seconds, XML } from "types/units";
import { Sampler } from "tone";
import { getMidiOctaveDistance, getMidiPitch } from "utils/midi";
import {
  EighthNoteTicks,
  WholeNoteTicks,
  isTripletNote,
} from "utils/durations";
import { DEFAULT_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { downloadBlob } from "utils/html";
import { getDegreeOfNoteInTrack, setSelectedPattern } from "redux/thunks";
import { random, sample } from "lodash";
import BasicScales from "presets/scales/BasicScales";

/** Creates a pattern and adds it to the slice. */
export const createPattern =
  (pattern: Partial<PatternNoId> = defaultPattern): Thunk<PatternId> =>
  (dispatch) => {
    const newPattern = initializePattern(pattern);
    dispatch(addPattern(newPattern));
    dispatch(setSelectedPattern(newPattern.id));
    return newPattern.id;
  };

/** Copies a pattern and adds it to the slice. */
export const copyPattern =
  (pattern: Pattern = defaultPattern): Thunk<PatternId> =>
  (dispatch) => {
    return dispatch(
      createPattern({ ...pattern, name: `${pattern.name} Copy` })
    );
  };

/** Removes a list of patterns from the store. */
export const deletePattern =
  (id: PatternId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { patternId } = selectDraftedPatternClip(project);
    const patternIds = selectPatternIds(project);

    // Get the index of the pattern to remove
    const index = patternIds.findIndex((patternId) => patternId === id);
    if (index === -1) return;

    // If the pattern is selected, select the previous or next pattern
    if (patternId === id) {
      const nextId = patternIds?.[index - 1] || patternIds?.[index + 1];
      if (nextId)
        dispatch(updateMediaDraft({ patternClip: { patternId: nextId } }));
    }

    // Remove the pattern
    dispatch(removePattern(id));
  };

/** Randomize a pattern using a random scale or the pattern's track chain */
export const randomizePattern =
  (id: PatternId, length: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get a random scale from the pattern track if possible
    const { patternTrackId } = pattern;
    const track = selectPatternTrackById(project, patternTrackId);
    const scaleChain = selectTrackScaleChain(project, patternTrackId);
    const scales = track ? scaleChain : Object.values(BasicScales);
    const scale = sample(scales);

    // Initialize the pattern stream
    const noteCount = length;
    const stream: PatternStream = [];
    const restPercent = 0.1;

    // Iterate over the note count
    for (let i = 0; i < noteCount; i++) {
      const seed = Math.random();
      if (seed < restPercent) {
        stream.push({ duration: SixteenthNoteTicks });
      } else {
        const noteCount = 1;
        const scaleNotes = getScaleAsArray(scale);
        const chord = new Array(noteCount).fill(0).map((_) => {
          const degree = random(0, scaleNotes.length - 1);
          return {
            degree,
            duration: SixteenthNoteTicks,
            velocity: DEFAULT_VELOCITY,
            scaleId: scale?.id,
          };
        });
        stream.push(chord);
      }
    }

    // Update the pattern
    dispatch(updatePattern({ id, stream }));
  };

/** Auto-bind a pattern to use the highest scales possible for each note. */
export const autoBindPattern =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern || !pattern.patternTrackId) return;

    // Get all of the pattern's scales
    const scaleTrackMap = selectTrackMidiScaleMap(project);
    const trackChain = [
      ...selectScaleTrackChain(project, pattern.patternTrackId),
    ];
    const scaleChain = selectTrackScaleChain(project, pattern.patternTrackId);

    // Order the pattern's MIDI scales from highest to lowest
    trackChain.reverse();
    const trackMidiScales = trackChain.map((track) => scaleTrackMap[track.id]);

    // Map the pattern's stream to the highest scales
    const midiStream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    const mappedStream = pattern.stream.map((block, i) => {
      // Skip if the block is a rest
      const midiBlock = midiStream[i];
      if (!isPatternChord(block) || !isPatternMidiChord(midiBlock)) {
        return block;
      }

      // Get the notes from both blocks
      const notes = getPatternChordNotes(block);
      const midiNotes = getPatternMidiChordNotes(midiBlock);

      // Iterate over each note of the block
      const newChord = notes.map((note, j) => {
        const midiNote = midiNotes[j].MIDI;
        // For each note, iterate over every track
        for (let t = 0; t < trackChain.length; t++) {
          // Find if a degree exists in the track
          const track = trackChain[t];
          const degree = dispatch(getDegreeOfNoteInTrack(track?.id, note));
          if (degree < 0) continue;

          // If a degree is found, find the corresponding MIDI note
          const midiScale = trackMidiScales[t];
          const scaleMidi = midiScale?.[degree];
          if (!midiScale || !scaleMidi) continue;

          const octave = getMidiOctaveDistance(scaleMidi, midiNote);
          const offset: ScaleVector = { octave };

          // Return the new note
          return {
            duration: note.duration,
            velocity: note.velocity,
            degree,
            offset,
            scaleId: track.scaleId,
          };
        }

        // If not possible, just return the note as is
        return note;
      });

      const newBlock = updatePatternChordNotes(block, newChord);
      return newBlock;
    });

    dispatch(updatePattern({ id, stream: mappedStream }));
  };

/** Clear the bindings of a pattern so that all notes are MIDI. */
export const clearPatternBindings =
  (id?: PatternId, clearTrack = false): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the MIDI stream
    const scaleChain = selectTrackScaleChain(project, pattern.patternTrackId);
    const midiStream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    const newStream = pattern.stream.map((block, i) => {
      if (isPatternStrummedChord(block)) {
        const midiBlock = midiStream[i];
        if (!isPatternMidiChord(midiBlock)) return block;
        const notes = getPatternMidiChordNotes(midiBlock);
        return updatePatternChordNotes(block, notes);
      }
      return block;
    });

    // Update the pattern
    dispatch(
      updatePattern({
        id,
        stream: newStream,
        patternTrackId: clearTrack ? undefined : pattern.patternTrackId,
      })
    );
  };

/** Play a pattern using the global audio instance. */
export const playPattern =
  (pattern?: Pattern): Thunk =>
  (dispatch, getProject) => {
    if (!pattern) return;
    const project = getProject();
    const transport = selectTransport(project);

    // Get the global audio instance
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Get the realized pattern notes
    const scaleChain = selectTrackScaleChain(project, pattern.patternTrackId);
    const stream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    if (!stream.length) return;

    // Make sure the instance is heard
    instance.solo = true;

    // Accumulate time
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < stream.length; i++) {
      // Get the stream chord
      const block = stream[i];
      const blockDuration = getPatternBlockDuration(block);
      if (!block || !blockDuration) continue;

      // Compute the time and skip if it's a rest
      const seconds = convertTicksToSeconds(transport, blockDuration);
      if (!isPatternMidiChord(block)) {
        time += seconds;
        continue;
      }

      // Compute the subdivisions and pitches
      const subdivision = getTickSubdivision(blockDuration);
      const notes = getPatternMidiChordNotes(block);
      const pitches = notes.map((note) => getMidiPitch(note.MIDI));

      // Set a timeout to play the chord
      setTimeout(() => {
        if (!instance.isLoaded()) return;
        instance.sampler.triggerAttackRelease(pitches, subdivision);
      }, time * 1000);

      // Accumulate time
      time += seconds;
    }

    // Un-solo the instance
    setTimeout(() => {
      instance.solo = false;
    }, time * 1000);
  };

/** Export a pattern to a MIDI file. */
export const exportPatternToMIDI =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;

    // Get the pattern
    const project = getProject();
    const transport = selectTransport(project);
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the stream
    const stream = pattern.stream;
    const streamLength = stream.length;
    if (!streamLength) return;

    // Get the scales needed for the pattern based on its track
    const scales = selectTrackScaleChain(project, pattern?.patternTrackId);

    // Prepare a new MIDI file
    const midi = new Midi();
    const track = midi.addTrack();
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < streamLength; i++) {
      const block = stream[i];
      if (!isPatternChord(block)) continue;

      // Get the duration of the chord and update time
      const blockDuration = getPatternBlockDuration(block);
      const duration = convertTicksToSeconds(transport, blockDuration);
      time += duration;

      // Add the notes to the track
      const noteTime = convertTicksToSeconds(transport, time);
      const notes = getPatternChordNotes(block);
      for (const note of notes) {
        if (isPatternMidiNote(note)) {
          track.addNote({
            midi: note.MIDI,
            duration,
            time: noteTime,
            velocity: note.velocity,
          });
          continue;
        }
        const scaleIndex = scales.findIndex((s) => s.id === note.scaleId);
        if (scaleIndex < 0) continue;
        const chain = scales.slice(0, scaleIndex + 1);
        const midi = resolvePatternNoteToMidi(note, chain);
        track.addNote({
          midi,
          duration,
          time: noteTime,
          velocity: note.velocity,
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

/** Export a Pattern to XML. */
export const exportPatternToXML =
  (pattern?: Pattern, download = false): Thunk<XML> =>
  (dispatch, getProject) => {
    if (!pattern) return DemoXML;
    const project = getProject();

    // Get the scale if it exists.
    const scaleChain = selectTrackScaleChain(project, pattern.patternTrackId);
    const scale = resolveScaleChainToMidi(scaleChain);

    // Get the stream and key based on the tonicized scale.
    const stream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    const key = getScaleKey(scale);

    // Initialize loop variables
    const measures: string[] = [];
    const measureNotes: string[] = [];
    let duration = 0;
    let tripletBeam = "begin";

    // Iterate through the stream and create measures
    for (const block of stream) {
      // If the duration is greater than a whole note, create a new measure.
      if (duration >= WholeNoteTicks) {
        const measure = MusicXML.createMeasure(
          measureNotes,
          measures.length + 1
        );
        measures.push(measure);
        measureNotes.clear();
        duration = 0;
      }

      // Extract info from the chord
      const ticks = getPatternBlockDuration(block);
      const type = getStraightDuration(getTickDuration(ticks));
      const notes = isPatternMidiChord(block)
        ? getPatternMidiChordNotes(block)
        : undefined;
      const firstNote = notes ? notes[0] : undefined;
      const isTriplet = isTripletNote(firstNote) && type !== "quarter";

      // Create the XML note
      const xmlNote = MusicXML.createBlock(block, {
        duration: ticks,
        type,
        beam: isTriplet ? tripletBeam : undefined,
        key,
      });

      // Update the triplet beam
      if (isTriplet) {
        if (tripletBeam === "begin") tripletBeam = "continue";
        else if (tripletBeam === "continue") tripletBeam = "end";
        else tripletBeam = "begin";
      } else {
        tripletBeam = "begin";
      }
      measureNotes.push(xmlNote);
      duration += ticks;
    }

    // If there are any notes left over, create a new measure
    if (measureNotes.length) {
      const measure = MusicXML.createMeasure(measureNotes, measures.length + 1);
      measures.push(measure);
    } else if (!measures.length) {
      const measure = MusicXML.createMeasure([]);
      measures.push(measure);
    }

    // Create the score part
    const id = `pattern`;
    const part = MusicXML.createPart(id, measures);
    const scorePart = MusicXML.createScorePart(id);
    const partList = MusicXML.createPartList([scorePart]);

    // Create the score
    const score = MusicXML.createScore(partList, [part]);
    const xml = MusicXML.serialize(score);

    // Download if necessary
    if (download) {
      const blob = new Blob([xml], { type: MusicXML.MIME_TYPE });
      downloadBlob(blob, `${pattern.name || "pattern"}.xml`);
    }

    // Return the XML string
    return xml;
  };

/** Play a PatternChord with a Sampler at a given time. */
export const playPatternChord = (
  sampler: Sampler,
  chord: PatternMidiChord,
  time: Seconds
) => {
  // Do nothing if the sampler is not loaded
  if (!sampler || !sampler.loaded) return;

  // Do nothing if the chord is invalid or empty
  if (!isPatternMidiChord(chord)) return;

  // Get the pitches
  const notes = getPatternMidiChordNotes(chord);
  if (!notes.length) return;
  const pitches: string[] = notes.map((note) => getMidiPitch(note.MIDI));

  // Get the Tone.js subdivision
  const duration = getPatternBlockDuration(notes) ?? EighthNoteTicks;
  const subdivision = getTickSubdivision(duration);

  // Get the velocity scaled for Tone.js
  const velocity = notes[0].velocity ?? DEFAULT_VELOCITY;
  const scaledVelocity = velocity / MAX_VELOCITY;

  // Play the chord with the sampler
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};
