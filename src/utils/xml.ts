import { DEFAULT_DURATION } from "utils/constants";
import { Key, Tick, XML } from "../types/units";
import * as _ from "utils/midi";
import {
  DurationType,
  PPQ,
  getTickDuration,
  isDottedDuration,
  isDottedNote,
  isTripletDuration,
  isTripletNote,
} from "utils/duration";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import {
  PatternMidiNote,
  PatternRest,
  isPatternMidiNote,
  PatternMidiBlock,
  isPatternMidiChord,
} from "types/Pattern/PatternTypes";
import { MidiNote } from "utils/midi";

// ------------------------------------------------------------
// MusicXML Constants
// ------------------------------------------------------------

export const XML_DECLARATION = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`;
export const XML_DOCTYPE = `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">`;
export const XML_HEADER = `${XML_DECLARATION}\n${XML_DOCTYPE}\n`;
export const XML_MIME_TYPE = "application/vnd.recordare.musicxml";

// ------------------------------------------------------------
// MusicXML Types
// ------------------------------------------------------------

export type NoteOptions = Partial<{
  duration: Tick;
  type: DurationType;
  beam: string;
  stem: "up" | "down";
  voice: number;
  staff: number;
  isChord: boolean;
  backup: number;
  dot: boolean;
  triplet: boolean;
  key?: Key;
  degree?: number;
  staves?: "treble" | "bass" | "grand";
}>;

export type MeasureOptions = Partial<{
  number: number;
  staves: "treble" | "bass" | "grand";
  quarters: number;
}>;

// ------------------------------------------------------------
// MusicXML Score Functions
// ------------------------------------------------------------

/** Serialize a MusicXML score using the score partwise. */
const serialize = (scorePartwise: XML) => {
  return `${XML_HEADER}${scorePartwise}`;
};

/** Create a MusicXML score using the part list and parts. */
const createScore = (partList: XML, parts: XML[]) => {
  return `<score-partwise version="4.0">
    ${partList}
    ${parts.join("")}
    </score-partwise>`;
};

/** Create a MusicXML part using the ID and measures. */
const createPart = (id: string, measures: XML[]) => {
  return `<part id="${id}">
      ${measures.join("")}
      </part>`;
};

/** Create a MusicXML part list using the score parts. */
const createPartList = (scoreParts: XML[]) => {
  return `<part-list>
    ${scoreParts.join("")}
  </part-list>`;
};

/** Create a MusicXML score part using the ID and name. */
const createScorePart = (id: string, name: string = "") => {
  return `<score-part id="${id}">
      <part-name>${name}</part-name>
    </score-part>`;
};

/** Create a MusicXML key signature. */
const createKeySignature = () => {
  return `<key>
      <fifths>0</fifths>
    </key>`;
};

/** Create a MusicXML time signature. */
const createTimeSignature = (beats = 4) => {
  return `<time>
      <beats>${beats}</beats>
      <beat-type>4</beat-type>
    </time>`;
};

/** Create a MusicXML treble clef. */
const createTrebleClef = () => {
  return `<clef>
      <sign>G</sign>
      <line>2</line>
    </clef>`;
};

/** Create a MusicXML bass clef. */
const createBassClef = () => {
  return `<clef>
      <sign>F</sign>
      <line>4</line>
    </clef>`;
};

/** Create a MusicXML grand staff. */
const createGrandStaff = () => {
  return `<staves>2</staves>
    <clef number="1">
      <sign>G</sign>
      <line>2</line>
    </clef>
    <clef number="2">
      <sign>F</sign>
      <line>4</line>
    </clef>`;
};

/** Create a MusicXML measure using the notes. */
const createMeasure = (notes: XML[], options: MeasureOptions = {}) => {
  const { number = 1, staves = "treble", quarters = 4 } = options;
  let clefs = createGrandStaff();
  if (staves === "treble") clefs = createTrebleClef();
  else if (staves === "bass") clefs = createBassClef();
  return `<measure number="${number}">
      <attributes>
        <divisions>${PPQ}</divisions>
        ${number === 1 ? createKeySignature() : ""} 
        ${number === 1 ? createTimeSignature(quarters) : ""}
        ${number === 1 ? clefs : ""}
      </attributes>
      ${notes.join("")}
    </measure>`;
};

/** Create a MusicXML note using the MIDI note number. */
const createNote = (
  note: MidiNote | PatternMidiNote | PatternRest,
  noteOptions: NoteOptions = {}
) => {
  const isMidi = isPatternMidiNote(note);
  const midi = isMidi ? _.getMidiValue(note) : undefined;
  const key = noteOptions?.key;

  /** The chord tag groups together notes. */
  const isChord = !!noteOptions?.isChord;
  const chordTag = !isChord
    ? ``
    : `
<chord/>`;

  /** The offset tag is the note's accidental offset */
  const offset = isMidi ? _.getMidiAccidentalNumber(note.MIDI, key) : "";
  const offsetTag =
    offset === 0
      ? ``
      : `
<alter>${offset}</alter>`;

  /** The pitch tag uses the note letter, accidental offset, and octave number. */
  const letter = isMidi ? _.getMidiPitchLetter(note.MIDI, key) : "";
  const octave = isMidi ? _.getMidiOctaveNumber(note.MIDI, key) : "";
  const pitchTag = `<pitch>
    <step>${letter}</step>${offsetTag}
    <octave>${octave}</octave>
  </pitch>`;

  /** The note tag uses the essential pitch info. */
  const noteTag = !isMidi
    ? `<rest />`
    : `${chordTag}
  ${pitchTag}`;

  /** The duration tag uses the note ticks. */
  const duration = noteOptions?.duration || 1;
  const durationTag = `<duration>${duration}</duration>`;

  /** The voice tag is used for clef management. */
  const voice = 1;
  const voiceTag = `<voice>${voice}</voice>`;

  /** The type tag uses the duration type. */
  const type = noteOptions?.type || DEFAULT_DURATION;
  const typeTag = `<type>${type}</type>`;

  /** The accidental tag displays the accidental. */
  const accidental = isMidi ? _.getMidiAccidental(note.MIDI, key) : "";
  const accidentalTag = `<accidental>${accidental}</accidental>`;

  /** The backup tag moves the cursor back in time. */
  const backup = noteOptions?.backup;
  const backupTag = backup
    ? `
  <backup><duration>${backup}</duration></backup>`
    : "";

  /** The stem tag indicates the stem direction. */
  const stem = noteOptions?.stem || (midi && midi > STEM_PIVOT ? "down" : "up");
  const stemTag = `<stem>${stem}</stem>`;

  /** The staff tag places the note in a staff. */
  const staff = noteOptions?.staff || 1;
  const staffTag = `<staff>${staff}</staff>`;

  /** The dot tag indicates a dotted note. */
  const dot = noteOptions?.dot || isDottedDuration(type);
  const dotTag = dot ? `<dot/>` : "";

  /** The beam tag uses a number based on duration. */
  const beam = noteOptions?.beam;
  const beamTag =
    beam !== undefined
      ? `${type === "eighth" ? `<beam number="1">${beam}</beam>` : ``}${
          type === "16th" ? `<beam number="1">${beam}</beam>` : ``
        }${type === "32nd" ? `<beam number="1">${beam}</beam>` : ``}${
          type === "64th" ? `<beam number="1">${beam}</beam>` : ``
        }`
      : "";

  /** The triplet tag creates the time modification. */
  const triplet = noteOptions?.triplet || isTripletDuration(type);
  const tripletTag = triplet ? `<notations><tuplet /></notations>` : "";

  /** The degree tag creates a fingering. */
  const degree = noteOptions?.degree;
  const degreeTag =
    degree !== undefined
      ? `<notations>
  <technical>
    <fingering placement="above">${degree + 1}</fingering>
  </technical>
</notations>`
      : "";

  return `${backupTag}
      <note>${noteTag}
        ${durationTag}
        ${voiceTag}
        ${typeTag}
        ${accidentalTag}
        ${stemTag}
        ${staffTag}
        ${dotTag}
        ${beamTag}
        ${tripletTag}
        ${degreeTag}
      </note>`;
};

export const STAFF_PIVOT = 58;
export const STEM_PIVOT = 84;

/** Create a MusicXML chord using the pattern MIDI chord. */
const createBlock = (block: PatternMidiBlock, noteOptions?: NoteOptions) => {
  const duration = noteOptions?.duration || 1;
  const beam = noteOptions?.beam;
  const type = noteOptions?.type || getTickDuration(duration);
  const dot = noteOptions?.dot || isDottedNote({ duration });
  const triplet = noteOptions?.triplet || isTripletNote({ duration });
  const key = noteOptions?.key;
  if (!isPatternMidiChord(block)) {
    const restOptions = {
      type,
      duration,
      dot,
      triplet,
      beam,
      key,
    };
    if (noteOptions?.staves === "treble") {
      return createNote(block, { ...restOptions, staff: 1 });
    }
    if (noteOptions?.staves === "bass") {
      return createNote(block, { ...restOptions, staff: 2 });
    }
    return [
      createNote(block, { ...restOptions, staff: 1 }),
      createNote(block, {
        ...restOptions,
        staff: 2,
        backup: duration,
      }),
    ].join("");
  }

  const notes = getPatternMidiChordNotes(block);
  const allNoteOptions = notes.map((note, i, arr) => {
    const notFirstInStaff1 =
      i > 0 && !!arr.slice(0, i).find((n) => n.MIDI >= STAFF_PIVOT);
    const notFirstInStaff2 =
      i > 0 && !!arr.slice(0, i).find((n) => n.MIDI < STAFF_PIVOT);

    const staff = note.MIDI >= STAFF_PIVOT ? 1 : 2;

    const isFirstVoice1 = staff === 1 && !notFirstInStaff1;
    const isFirstVoice2 = staff === 2 && !notFirstInStaff2;

    const uniqueStaff =
      (isFirstVoice1 && notFirstInStaff2) ||
      (isFirstVoice2 && notFirstInStaff1);

    const options: NoteOptions = {
      ...noteOptions,
      beam,
      type,
      duration,
      staff,
      isChord:
        (staff === 1 && notFirstInStaff1) || (staff === 2 && notFirstInStaff2),
      backup: uniqueStaff ? duration : undefined,
      dot,
      triplet,
      key,
      staves: noteOptions?.staves,
    };

    return options;
  });

  const xmlNotes = allNoteOptions.map((noteOptions, i) =>
    createNote(notes[i], noteOptions)
  );
  if (noteOptions?.staves !== "grand") return xmlNotes.join("");

  // Create a rest for each staff that is missing a note (if staves > 1)
  const staffs = allNoteOptions.map((note) => note.staff);
  const missingStaffs = [1, 2].filter((staff) => !staffs.includes(staff));
  const staffRests = missingStaffs.map((staff) =>
    createNote(
      { duration },
      {
        type,
        staff,
        duration,
        backup: duration,
        dot,
        triplet,
        beam,
        key,
      }
    )
  );
  return [...xmlNotes, ...staffRests].join("");
};

const MusicXML = {
  serialize,
  createScore,
  createPart,
  createPartList,
  createScorePart,
  createKeySignature,
  createTimeSignature,
  createTrebleClef,
  createBassClef,
  createGrandStaff,
  createMeasure,
  createNote,
  createBlock,
};

export { MusicXML };
