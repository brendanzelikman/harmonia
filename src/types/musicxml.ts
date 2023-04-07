import { DEFAULT_DURATION, MAX_SUBDIVISION } from "appConstants";
import { beatsToDuration } from "appUtil";
import { Duration, Note, XML } from "types/units";
import { MIDI } from "./midi";

const declaration: XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
const doctype: XML =
  '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">';

type NoteOptions = Partial<{
  duration: number;
  beam: "begin" | "continue" | "end";
  type: Duration;
  stem: "up" | "down";
  voice: number;
  staff: number;
  isChord: boolean;
  isRest: boolean;
  backup: number;
}>;

export default class MusicXML {
  static createNote(note: Note, noteOptions?: NoteOptions): XML {
    const letter = MIDI.toLetter(note);
    const octave = MIDI.toOctave(note);
    const offset = MIDI.toOffset(note);
    // const beam = noteOptions?.beam || "continue";
    const duration = noteOptions?.duration || 1;
    const type = noteOptions?.type || DEFAULT_DURATION;
    const stem = noteOptions?.stem || "up";
    const isChord = noteOptions?.isChord || false;
    const isRest = noteOptions?.isRest || false;
    const voice = 1;
    const staff = noteOptions?.staff || 1;
    const backup = noteOptions?.backup;

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
          <stem>${stem}</stem>
          <staff>${staff}</staff>
        </note>`;
  }

  static createChord(notes: Note[], noteOptions?: NoteOptions): XML {
    const duration = noteOptions?.duration || 1;
    const beam = noteOptions?.beam || "continue";
    const type = noteOptions?.type || beatsToDuration(duration);
    const stem = noteOptions?.stem || "up";

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
          <divisions>${MAX_SUBDIVISION / 4}</divisions>
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
