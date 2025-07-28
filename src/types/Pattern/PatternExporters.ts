import { MusicXML, STAFF_PIVOT } from "utils/xml";
import {
  QUARTER_NOTE_TICKS,
  getStraightDuration,
  getTickDuration,
  isTripletNote,
} from "utils/duration";
import { downloadBlob } from "utils/event";
import { getScaleKey } from "types/Scale/ScaleFinder";
import { getPatternBlockDuration } from "./PatternFunctions";
import { isPatternMidiChord, PatternMidiStream } from "./PatternTypes";
import {
  flattenMidiStreamValues,
  getPatternMidiChordNotes,
} from "./PatternUtils";
import { chromaticNotes } from "types/Scale/ScaleTypes";
import { XML_MIME_TYPE } from "utils/xml";

export const exportPatternStreamToXML = ({
  stream = [],
  scale = chromaticNotes,
  timeSignature = 4,
  download = false,
}: Partial<{
  stream: PatternMidiStream;
  scale: number[];
  timeSignature: number;
  download: boolean;
}>) => {
  const key = getScaleKey(scale);
  const streamValues = flattenMidiStreamValues(stream);
  const hasBass = streamValues.some((n) => n < STAFF_PIVOT);
  const hasTreble = streamValues.some((n) => n >= STAFF_PIVOT);
  const staves = hasBass && hasTreble ? "grand" : hasBass ? "bass" : "treble";

  // Initialize loop variables
  const quarters = timeSignature as number;
  const measures: string[] = [];
  const measureNotes: string[] = [];
  let duration = 0;
  let tripletBeam = "begin";

  // Iterate through the stream and create measures
  for (const block of stream) {
    // If the duration is greater than a bar, create a new measure.
    if (duration >= quarters * QUARTER_NOTE_TICKS) {
      const number = measures.length + 1;
      const measure = MusicXML.createMeasure(measureNotes, {
        number,
        staves,
        quarters,
      });
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
      quarters,
    });
    measures.push(measure);
  }

  // If there are no measures, push default
  else if (!measures.length) {
    measures.push(
      MusicXML.createMeasure([], { number: 1, staves: "treble", quarters })
    );
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
    const blob = new Blob([xml], { type: XML_MIME_TYPE });
    downloadBlob(blob, `${"pattern"}.xml`);
  }

  // Return the XML string
  return xml;
};
