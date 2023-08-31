import { DEFAULT_DURATION } from "appConstants";
import { ticksToDuration } from "appUtil";
import { Duration, Note, XML } from "./units";
import { MIDI } from "./midi";

const declaration: XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
const doctype: XML =
  '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">';

type NoteOptions = Partial<{
  duration: number;
  beam: string;
  type: Duration;
  stem: "up" | "down";
  voice: number;
  staff: number;
  isChord: boolean;
  isRest: boolean;
  backup: number;
  dot: boolean;
  triplet: boolean;
}>;

export default class MusicXML {
  static createNote(note: Note, noteOptions?: NoteOptions): XML {
    const letter = MIDI.toLetter(note);
    const octave = MIDI.toOctave(note);
    const offset = MIDI.toOffset(note);
    const beam = noteOptions?.beam;
    const duration = noteOptions?.duration || 1;
    const type = noteOptions?.type || DEFAULT_DURATION;
    const stem = noteOptions?.stem || "up";
    const isChord = !!noteOptions?.isChord;
    const isRest = !!noteOptions?.isRest;
    const voice = 1;
    const staff = noteOptions?.staff || 1;
    const backup = noteOptions?.backup;
    const dot = noteOptions?.dot || MIDI.isDotted({ duration });
    const triplet = noteOptions?.triplet || MIDI.isTriplet({ duration });

    return `${
      backup
        ? `
        <backup><duration>${backup}</duration></backup>`
        : ""
    }
        <note>${
          isRest
            ? `<rest />`
            : `${
                !isChord
                  ? ``
                  : `
            <chord/>`
              }
          <pitch>
            <step>${letter}</step>${
                offset === 0
                  ? ``
                  : `
            <alter>${offset}</alter>`
              }
            <octave>${octave}</octave>
          </pitch>`
        }
          <duration>${duration}</duration>
          <voice>${voice}</voice>
          <type>${type}</type>
          ${
            triplet
              ? `<time-modification>
            <actual-notes>3</actual-notes>
            <normal-notes>2</normal-notes>
          </time-modification>`
              : ""
          }
          <stem>${stem}</stem>
          <staff>${staff}</staff>
          ${dot ? `<dot />` : ""}
          ${
            !!beam
              ? `${
                  duration <= MIDI.EighthNoteTicks
                    ? `<beam number="1">${beam}</beam>`
                    : ``
                }${
                  duration <= MIDI.SixteenthNoteTicks
                    ? `<beam number="2">${beam}</beam>`
                    : ``
                }${
                  duration <= MIDI.ThirtySecondNoteTicks
                    ? `<beam number="3">${beam}</beam>`
                    : ``
                }${
                  duration <= MIDI.SixtyFourthNoteTicks
                    ? `<beam number="4">${beam}</beam>`
                    : ``
                }`
              : ""
          }
        </note>`;
  }

  // ${
  //   triplet && !!beam
  //     ? beam === "begin"
  //       ? `
  // <notations>
  //   <tuplet type="start" bracket="no" />
  // </notations>`
  //       : beam === "end"
  //       ? `
  // <notations>
  //   <tuplet type="stop" />
  // </notations>`
  //       : ""
  //     : ""
  // }

  static createChord(notes: Note[], noteOptions?: NoteOptions): XML {
    const duration = noteOptions?.duration || 1;
    const beam = noteOptions?.beam;
    const type = noteOptions?.type || ticksToDuration(duration);
    const stem = noteOptions?.stem || "up";
    const dot = noteOptions?.dot || MIDI.isDotted({ duration });
    const triplet = noteOptions?.triplet || MIDI.isTriplet({ duration });

    const pivotNote = 58;
    const allNoteOptions = notes.map((note, i, arr) => {
      const notFirstInStaff1 =
        i > 0 && !!arr.slice(0, i).find((n) => n >= pivotNote);
      const notFirstInStaff2 =
        i > 0 && !!arr.slice(0, i).find((n) => n < pivotNote);

      const staff = note >= pivotNote ? 1 : 2;

      const isFirstVoice1 = staff === 1 && !notFirstInStaff1;
      const isFirstVoice2 = staff === 2 && !notFirstInStaff2;

      const uniqueStaff =
        (isFirstVoice1 && notFirstInStaff2) ||
        (isFirstVoice2 && notFirstInStaff1);

      const noteOptions = {
        beam,
        type,
        stem,
        duration,
        staff,
        isChord:
          (staff === 1 && notFirstInStaff1) ||
          (staff === 2 && notFirstInStaff2),
        isRest: note === MIDI.Rest,
        backup: uniqueStaff ? duration : undefined,
        dot,
        triplet,
      };

      return noteOptions;
    });

    const xmlNotes = allNoteOptions.map((noteOptions, i) =>
      MusicXML.createNote(notes[i], noteOptions)
    );

    // Create a rest for each staff that is missing a note
    const staffs = allNoteOptions.map((note) => note.staff);
    const missingStaffs = [1, 2].filter((staff) => !staffs.includes(staff));
    const staffRests = missingStaffs.map((staff) =>
      MusicXML.createNote(MIDI.Rest, {
        type,
        staff,
        duration,
        isRest: true,
        backup: duration,
        dot,
        triplet,
        beam,
      })
    );
    return [...xmlNotes, ...staffRests].join("");
  }

  static createMeasure(notes: XML[], number = 1, staves = 2): XML {
    const listedNotes = notes.join("");
    const keySignature = `<key>
            <fifths>0</fifths>
          </key>`;
    const timeSignature = `<time>
            <beats>4</beats>
            <beat-type>4</beat-type>
          </time>`;
    const clefs =
      staves === 1
        ? `<staves>1></staves>
          <clef>
            <sign>G</sign>
            <line>2</line>
          </clef>`
        : `<staves>2</staves>
          <clef number="1">
            <sign>G</sign>
            <line>2</line>
          </clef>
          <clef number="2">
            <sign>F</sign>
            <line>4</line>
          </clef>`;

    return `<measure number="${number}">
        <attributes>
          <divisions>${MIDI.PPQ}</divisions>
          ${number === 1 ? keySignature : ""} 
          ${number === 1 ? timeSignature : ""}
          ${number === 1 ? clefs : ""}
        </attributes>
        ${listedNotes}
      </measure>`;
  }

  static createScorePart(id: string, name: string = ""): XML {
    return `<score-part id="${id}">
        <part-name>${name}</part-name>
      </score-part>`;
  }

  static createPartList(scoreParts: XML[]): XML {
    const listedScoreParts = scoreParts.join("");
    return `<part-list>
      ${listedScoreParts}
    </part-list>`;
  }

  static createPart(id: string, measures: XML[]): XML {
    const listedMeasures = measures.join("");
    return `<part id="${id}">
      ${listedMeasures}
      </part>`;
  }

  static createScore(partList: XML, parts: XML[]) {
    const listedParts = parts.join("");
    return `<score-partwise version="4.0">
    ${partList}
    ${listedParts}
    </score-partwise>`;
  }

  static serialize(scorePartwise: XML): XML {
    return `${declaration}\n${doctype}\n${scorePartwise}`;
  }
}
