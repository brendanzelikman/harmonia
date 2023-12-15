import { DEFAULT_DURATION } from "utils/constants";
import { Key, Tick, XML } from "../types/units";
import * as _ from "utils/midi";
import {
  DurationType,
  EighthNoteTicks,
  PPQ,
  SixteenthNoteTicks,
  SixtyFourthNoteTicks,
  ThirtySecondNoteTicks,
  getTickDuration,
  isDottedDuration,
  isDottedNote,
  isTripletDuration,
  isTripletNote,
} from "utils/durations";
import {
  PatternMidiBlock,
  PatternMidiNote,
  PatternRest,
  getPatternMidiChordNotes,
  isPatternMidiChord,
  isPatternMidiNote,
} from "types/Pattern";
import { MidiNote } from "types/Scale";

// ------------------------------------------------------------
// MusicXML Constants
// ------------------------------------------------------------

const DECLARATION = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`;
const DOCTYPE = `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">`;
const HEADER = `${DECLARATION}\n${DOCTYPE}\n`;
const MIME_TYPE = "application/vnd.recordare.musicxml";

// ------------------------------------------------------------
// MusicXML Types
// ------------------------------------------------------------

type NoteOptions = Partial<{
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
}>;

// ------------------------------------------------------------
// MusicXML Score Functions
// ------------------------------------------------------------

/** Serialize a MusicXML score using the score partwise. */
const serialize = (scorePartwise: XML) => {
  return `${HEADER}${scorePartwise}`;
};

/** Create a MusicXML score using the part list and parts. */
const createScore = (partList: XML, parts: XML[]) => {
  const listedParts = parts.join("");
  return `<score-partwise version="4.0">
    ${partList}
    ${listedParts}
    </score-partwise>`;
};

/** Create a MusicXML part using the ID and measures. */
const createPart = (id: string, measures: XML[]) => {
  const listedMeasures = measures.join("");
  return `<part id="${id}">
      ${listedMeasures}
      </part>`;
};

/** Create a MusicXML part list using the score parts. */
const createPartList = (scoreParts: XML[]) => {
  const listedScoreParts = scoreParts.join("");
  return `<part-list>
    ${listedScoreParts}
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
const createTimeSignature = () => {
  return `<time>
      <beats>4</beats>
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
      <sign>G</sign>
      <line>2</line>
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
const createMeasure = (notes: XML[], number = 1, staves = 2) => {
  const listedNotes = notes.join("");
  const keySignature = createKeySignature();
  const timeSignature = createTimeSignature();
  const clefs = staves === 1 ? createTrebleClef() : createGrandStaff();

  return `<measure number="${number}">
      <attributes>
        <divisions>${PPQ}</divisions>
        ${number === 1 ? keySignature : ""} 
        ${number === 1 ? timeSignature : ""}
        ${number === 1 ? clefs : ""}
      </attributes>
      ${listedNotes}
    </measure>`;
};

/** Create a MusicXML note using the MIDI note number. */
const createNote = (
  note: MidiNote | PatternMidiNote | PatternRest,
  noteOptions: NoteOptions = {}
) => {
  const isMidi = isPatternMidiNote(note);
  const key = noteOptions?.key;

  /** The backup tag moves the cursor back in time. */
  const backup = noteOptions?.backup;
  const backupTag = backup
    ? `
  <backup><duration>${backup}</duration></backup>`
    : "";

  /** The chord tag groups together notes. */
  const isChord = !!noteOptions?.isChord;
  const chordTag = !isChord
    ? ``
    : `
<chord/>`;

  /** The offset tag is the note's accidental offset */
  const offset = isMidi ? _.getMidiAccidentalOffset(note.MIDI, key) : "";
  const offsetTag =
    offset === 0
      ? ``
      : `
<alter>${offset}</alter>`;

  /** The pitch tag uses the note letter, accidental offset, and octave number. */
  const letter = isMidi ? _.getMidiNoteLetter(note.MIDI, key) : "";
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
  const accidentalTag =
    accidental !== "natural" ? `<accidental>${accidental}</accidental>` : "";

  /** The triplet tag creates the time modification. */
  const triplet = noteOptions?.triplet || isTripletDuration(type);
  const tripletTag = triplet
    ? `<time-modification>
<actual-notes>3</actual-notes>
<normal-notes>2</normal-notes>
</time-modification>`
    : "";

  /** The stem tag indicates the stem direction. */
  const stem = noteOptions?.stem || "up";
  const stemTag = `<stem>${stem}</stem>`;

  /** The staff tag places the note in a staff. */
  const staff = noteOptions?.staff || 1;
  const staffTag = `<staff>${staff}</staff>`;

  /** The dot tag indicates a dotted note. */
  const dot = noteOptions?.dot || isDottedDuration(type);
  const dotTag = dot ? `<dot/>` : "";

  /** The beam tag uses a number based on duration. */
  const beam = noteOptions?.beam;
  const beamTag = !!beam
    ? `${duration <= EighthNoteTicks ? `<beam number="1">${beam}</beam>` : ``}${
        duration <= SixteenthNoteTicks ? `<beam number="2">${beam}</beam>` : ``
      }${
        duration <= ThirtySecondNoteTicks
          ? `<beam number="3">${beam}</beam>`
          : ``
      }${
        duration <= SixtyFourthNoteTicks
          ? `<beam number="4">${beam}</beam>`
          : ``
      }`
    : "";

  return `${backupTag}
      <note>
        ${noteTag}
        ${durationTag}
        ${voiceTag}
        ${typeTag}
        ${accidentalTag}
        ${tripletTag}
        ${stemTag}
        ${staffTag}
        ${dotTag}
        ${beamTag}
      </note>`;
};

/** Create a MusicXML chord using the pattern MIDI chord. */
const createBlock = (block: PatternMidiBlock, noteOptions?: NoteOptions) => {
  const duration = noteOptions?.duration || 1;
  const beam = noteOptions?.beam;
  const type = noteOptions?.type || getTickDuration(duration);
  const stem = noteOptions?.stem || "up";
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
    const rests = [
      createNote(block, { ...restOptions, staff: 1 }),
      createNote(block, {
        ...restOptions,
        staff: 2,
        backup: duration,
      }),
    ];
    return rests.join("");
  }

  const notes = getPatternMidiChordNotes(block);
  const pivotNote = 58;
  const allNoteOptions = notes.map((note, i, arr) => {
    const notFirstInStaff1 =
      i > 0 && !!arr.slice(0, i).find((n) => n.MIDI >= pivotNote);
    const notFirstInStaff2 =
      i > 0 && !!arr.slice(0, i).find((n) => n.MIDI < pivotNote);

    const staff = note.MIDI >= pivotNote ? 1 : 2;

    const isFirstVoice1 = staff === 1 && !notFirstInStaff1;
    const isFirstVoice2 = staff === 2 && !notFirstInStaff2;

    const uniqueStaff =
      (isFirstVoice1 && notFirstInStaff2) ||
      (isFirstVoice2 && notFirstInStaff1);

    const noteOptions: NoteOptions = {
      beam,
      type,
      stem,
      duration,
      staff,
      isChord:
        (staff === 1 && notFirstInStaff1) || (staff === 2 && notFirstInStaff2),
      backup: uniqueStaff ? duration : undefined,
      dot,
      triplet,
      key,
    };

    return noteOptions;
  });

  const xmlNotes = allNoteOptions.map((noteOptions, i) =>
    createNote(notes[i], noteOptions)
  );

  // Create a rest for each staff that is missing a note
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
  MIME_TYPE,
};

export { MusicXML };
