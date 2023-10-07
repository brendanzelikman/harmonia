import { DemoXML } from "assets/demoXML";
import { getScaleKey } from "types/key";
import { MIDI } from "types/midi";
import MusicXML from "types/musicxml";
import { PresetScaleMap } from "presets/scales";
import { Scale, chromaticScale, getTransposedScale } from "types/Scale";
import { XML } from "types/units";
import { ticksToDuration } from "utils";
import { getPatternOptions, getRealizedPatternNotes } from "./PatternFunctions";
import { Pattern, isPattern } from "./PatternTypes";

/**
 * Export a Pattern to XML.
 * @param pattern Optional. The Pattern to export to XML.
 * @returns The XML string. If the Pattern is invalid, a demo pattern will be exported.
 */
export const exportPatternToXML = (pattern?: Pattern): XML => {
  // Return the demo XML if the pattern is invalid
  if (!isPattern(pattern)) return DemoXML;

  // Unpack the pattern options
  const { tonic, scaleId, quantizeToScale } = getPatternOptions(pattern);

  // Get the scale if quantized, otherwise use the chromatic scale.
  const scale = quantizeToScale
    ? PresetScaleMap[scaleId] ?? chromaticScale
    : chromaticScale;

  // Get the tonic distance and transpose the scale.
  const tonicDistance = MIDI.ChromaticDistance(tonic, scale.notes[0]);
  const tonicizedScale = getTransposedScale(scale, tonicDistance) as Scale;

  // Get the stream and key based on the tonicized scale.
  const stream = getRealizedPatternNotes(pattern, tonicizedScale);
  const key = getScaleKey(tonicizedScale);

  // Initialize loop variables
  const measures: string[] = [];
  const measureNotes: string[] = [];
  let duration = 0;
  let tripletBeam = "begin";

  // Iterate through the stream and create measures
  for (const chord of stream) {
    // If the duration is greater than a whole note, create a new measure.
    if (duration >= MIDI.WholeNoteTicks) {
      const measure = MusicXML.createMeasure(measureNotes, measures.length + 1);
      measures.push(measure);
      measureNotes.clear();
      duration = 0;
    }

    // Extract info from the chord
    const chordNotes = chord.map((note) => note.MIDI);
    const firstNote = chord?.[0];
    const isTriplet = MIDI.isTriplet(firstNote);

    // Create the XML note
    const xmlNote = MusicXML.createChord(chordNotes, {
      duration: firstNote?.duration,
      type: ticksToDuration(firstNote?.duration),
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
    duration += firstNote?.duration;
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

  // Return the XML
  return MusicXML.serialize(score);
};
