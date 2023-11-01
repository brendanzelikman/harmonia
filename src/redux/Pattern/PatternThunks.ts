import {
  getStraightDuration,
  getTickDuration,
  getTickSubdivision,
} from "utils/durations";
import {
  selectDraftedClip,
  selectPatternById,
  selectScaleTrackScales,
  selectTrackChain,
  selectTrackScaleChain,
  selectTransport,
} from "redux/selectors";
import { Thunk } from "types/Project";
import {
  Pattern,
  PatternId,
  PatternMidiChord,
  PatternNoId,
  defaultPattern,
  getPatternBlockDuration,
  initializePattern,
  isPatternChord,
  isPatternMidiNote,
  isPatternRest,
  resolvePatternNoteToMidi,
  resolvePatternStreamToMidi,
} from "types/Pattern";
import { Midi } from "@tonejs/midi";
import { addPattern, removePattern, selectPatternIds } from "redux/Pattern";
import { convertTicksToSeconds } from "types/Transport";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { updateMediaDraft } from "redux/Timeline";
import { DemoXML } from "assets/demoXML";
import { resolveScaleChainToMidi } from "types/Scale";
import { getScaleKey } from "utils/key";
import { MusicXML } from "lib/musicxml";
import { Seconds, XML } from "types/units";
import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import {
  EighthNoteTicks,
  WholeNoteTicks,
  isTripletNote,
} from "utils/durations";
import { DEFAULT_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { downloadBlob } from "utils/html";

/** Creates a pattern and adds it to the slice. */
export const createPattern =
  (pattern: Partial<PatternNoId> = defaultPattern): Thunk<PatternId> =>
  (dispatch) => {
    const newPattern = initializePattern(pattern);
    dispatch(addPattern(newPattern));
    return newPattern.id;
  };

/** Copies a pattern and adds it to the slice. */
export const copyPattern =
  (pattern: Pattern = defaultPattern): Thunk<PatternId> =>
  (dispatch) => {
    const newPattern = initializePattern({
      ...pattern,
      name: `${pattern.name} Copy`,
    });
    dispatch(addPattern(newPattern));
    return newPattern.id;
  };

/** Removes a list of patterns from the store. */
export const deletePattern =
  (id: PatternId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { patternId } = selectDraftedClip(project);
    const patternIds = selectPatternIds(project);

    // Get the index of the pattern to remove
    const index = patternIds.findIndex((patternId) => patternId === id);
    if (index === -1) return;

    // If the pattern is selected, select the previous or next pattern
    if (patternId === id) {
      const nextId = patternIds?.[index - 1] || patternIds?.[index + 1];
      if (nextId) dispatch(updateMediaDraft({ clip: { patternId: nextId } }));
    }

    // Remove the pattern
    dispatch(removePattern(id));
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
      if (isPatternRest(block)) {
        time += seconds;
        continue;
      }

      // Compute the subdivisions and pitches
      const subdivision = getTickSubdivision(blockDuration);
      const pitches = block.map((note) => getMidiPitch(note.MIDI));

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
    const parents = selectTrackChain(project, pattern?.patternTrackId);
    const parentIds = parents.map((p) => p.id);
    const scales = selectScaleTrackScales(project, parentIds);

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
      for (const note of block) {
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
      const firstNote = isPatternRest(block) ? undefined : block?.[0];
      const isTriplet = isTripletNote(firstNote);

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
  // Do nothing if the chord is invalid or empty
  if (!isPatternChord(chord) || !chord.length) return;

  // Do nothing if the sampler is not loaded
  if (!sampler || !sampler.loaded) return;

  // Get the pitches
  const pitches: string[] = chord.map((note) => getMidiPitch(note.MIDI));

  // Get the Tone.js subdivision
  const duration = chord[0].duration ?? EighthNoteTicks;
  const subdivision = getTickSubdivision(duration);

  // Get the velocity scaled for TOne.js
  const velocity = chord[0].velocity ?? DEFAULT_VELOCITY;
  const scaledVelocity = velocity / MAX_VELOCITY;

  // Play the chord with the sampler
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};
