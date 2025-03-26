import { DemoXML } from "assets/demoXML";
import { MusicXML, STAFF_PIVOT } from "lib/musicxml";
import { Thunk } from "types/Project/ProjectTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { XML } from "types/units";
import {
  WholeNoteTicks,
  getStraightDuration,
  getTickDuration,
  isTripletNote,
  ticksToSeconds,
} from "utils/durations";
import { downloadBlob } from "utils/html";
import { getScaleKey } from "utils/scale";
import { getPatternBlockDuration } from "./PatternFunctions";
import {
  resolvePatternNoteToMidi,
  resolvePatternStreamToMidi,
} from "./PatternResolvers";
import { selectPatternById } from "./PatternSelectors";
import {
  PatternId,
  isPatternChord,
  isPatternMidiNote,
  isPatternMidiChord,
  Pattern,
  PatternMidiStream,
} from "./PatternTypes";
import {
  flattenMidiStreamValues,
  getPatternChordNotes,
  getPatternMidiChordNotes,
} from "./PatternUtils";
import { Midi } from "@tonejs/midi";
import {
  chromaticNotes,
  chromaticScale,
  ScaleChain,
} from "types/Scale/ScaleTypes";

export const exportPatternStreamToXML = (
  stream: PatternMidiStream,
  scale: number[] = chromaticNotes,
  download = false
) => {
  const key = getScaleKey(scale);
  const streamValues = flattenMidiStreamValues(stream);
  const hasBass = streamValues.some((n) => n < STAFF_PIVOT);
  const hasTreble = streamValues.some((n) => n >= STAFF_PIVOT);
  const staves = hasBass && hasTreble ? "grand" : hasBass ? "bass" : "treble";

  // Initialize loop variables
  const measures: string[] = [];
  const measureNotes: string[] = [];
  let duration = 0;
  let tripletBeam = "begin";

  // Iterate through the stream and create measures
  for (const block of stream) {
    // If the duration is greater than a whole note, create a new measure.
    if (duration >= WholeNoteTicks) {
      const number = measures.length + 1;
      const measure = MusicXML.createMeasure(measureNotes, { number, staves });
      measures.push(measure);
      measureNotes.clear();
      duration = 0;
    }

    // Extract info from the chord
    const ticks = getPatternBlockDuration(block);
    const blockType = getStraightDuration(getTickDuration(ticks));
    const notes = isPatternMidiChord(block)
      ? getPatternMidiChordNotes(block)
      : undefined;
    const firstNote = notes ? notes[0] : undefined;
    const isTriplet = isTripletNote(firstNote);

    // Create the XML note
    const xmlNote = MusicXML.createBlock(block, {
      duration: ticks,
      type: blockType,
      beam: isTriplet ? tripletBeam : undefined,
      key,
      staves,
    });

    // Update the triplet beam
    if (isTriplet) {
      if (tripletBeam === "begin") {
        tripletBeam = "continue";
      } else if (tripletBeam === "continue") {
        tripletBeam = "end";
      } else {
        tripletBeam = "begin";
      }
    } else {
      tripletBeam = "begin";
    }
    measureNotes.push(xmlNote);
    duration += ticks;
  }

  // If there are any notes left over, create a new measure
  if (measureNotes.length) {
    const measure = MusicXML.createMeasure(measureNotes, {
      number: measures.length + 1,
      staves,
    });
    measures.push(measure);
  }

  // If there are no measures, push default
  else if (!measures.length) {
    measures.push(MusicXML.createMeasure([], { number: 1, staves: "treble" }));
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
    downloadBlob(blob, `${"pattern"}.xml`);
  }

  // Return the XML string
  return xml;
};

/** Export a Pattern to XML. */
export const exportPatternToXML = (
  pattern?: Pattern,
  scales: ScaleChain = [chromaticScale],
  download = false
): XML => {
  if (!pattern || !scales) return DemoXML;
  const stream = resolvePatternStreamToMidi(pattern.stream, scales);
  const scale = resolveScaleChainToMidi(scales);
  return exportPatternStreamToXML(stream, scale, download);
};

/** Export a pattern to a MIDI file. */
export const exportPatternToMIDI =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;

    // Get the pattern
    const project = getProject();
    const bpm = selectTransportBPM(project);
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the stream
    const stream = pattern.stream;
    const streamLength = stream.length;
    if (!streamLength) return;

    // Get the scales needed for the pattern based on its track
    const scales = selectTrackScaleChain(project, pattern?.trackId);

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
      const duration = ticksToSeconds(blockDuration, bpm);
      time += duration;

      // Add the notes to the track
      const noteTime = ticksToSeconds(time, bpm);
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
