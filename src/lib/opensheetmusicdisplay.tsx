import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Cursor,
  IOSMDOptions,
  OpenSheetMusicDisplay as OSMD,
} from "opensheetmusicdisplay";
import { clamp } from "lodash";
import { sleep } from "utils/html";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import {
  PatternMidiStream,
  isPatternMidiChord,
} from "types/Pattern/PatternTypes";
import { MidiNote } from "utils/midi";
import { mod } from "utils/math";

// ------------------------------------------------------------
// OSMD Constants
// ------------------------------------------------------------

const ZOOM = 0.95;
const MARGIN_X = 3;
const MARGIN_Y = 2;

// ------------------------------------------------------------
// OSMD Interfaces
// ------------------------------------------------------------

/** The OSMD hook requires an XML string and accepts a stream or array of notes. */
export interface BaseProps {
  xml: string;
  id?: string;
  className?: string;
  options?: IOSMDOptions;
  noteClasses?: string[];
  noteColor?: string;
  onNoteClick?: NoteCallback;
}
export type StreamProps = BaseProps & { stream?: PatternMidiStream };
export type ArrayProps = BaseProps & { notes?: MidiNote[] };
export type NoteList = PatternMidiStream | MidiNote[];
export type OSMDProps = StreamProps | ArrayProps;

/** The default score options hide all non-note information. */
const defaultOptions: IOSMDOptions = {
  autoResize: true,
  drawTitle: false,
  drawSubtitle: false,
  drawPartNames: false,
  drawMeasureNumbers: false,
  drawTimeSignatures: false,
  disableCursor: false,
};

// ------------------------------------------------------------
// OSMD Score
// ------------------------------------------------------------

/** The hook returns a reference to the score, cursor, and notes. */
export interface ScoreProps {
  score: JSX.Element;
  osmd?: OSMD;
  cursor: CursorProps;
  scoreNotes: NoteProps[];
}

/** Formats the engraving rules of a score. */
function formatScoreEngravingRules(score?: OSMD) {
  if (!score) return;
  score.EngravingRules.PageLeftMargin = MARGIN_X;
  score.EngravingRules.PageRightMargin = MARGIN_X;
  score.EngravingRules.PageTopMargin = MARGIN_Y;
  score.EngravingRules.PageBottomMargin = MARGIN_Y;
  score.EngravingRules.MeasureLeftMargin = 5;
}

/** Render an XML string as a score using a list of notes. */
export function useOSMD(props: OSMDProps): ScoreProps {
  const { id, xml, className } = props;

  // Score info
  const ref = useRef<HTMLDivElement>(null);
  const [osmd, setOSMD] = useState<OSMD>();
  const options: IOSMDOptions = {
    ...defaultOptions,
    ...props.options,
    renderSingleHorizontalStaffline: true,
    disableCursor: false,
  };

  // Note info
  const [noteElements, setNoteElements] = useState<NoteProps[]>([]);
  const notes =
    "stream" in props
      ? props.stream ?? []
      : "notes" in props
      ? props.notes ?? []
      : ([] as MidiNote[]);
  const noteCount = notes.length;

  // Cursor info
  const cursor = useOSMDCursor(osmd, noteCount);

  // Re-render the score whenever any props change
  useEffect(() => {
    if (!ref.current) return;

    // Check if the score and canvas exist
    const canvas = document.getElementById("osmdCanvasPage1");
    const doesCanvasExist = !!canvas;
    const doesScoreExist = !!osmd;

    // Re-create the score unless the score and canvas exist
    let score: OSMD;
    if (doesScoreExist && doesCanvasExist) {
      score = osmd;
    } else {
      score = new OSMD(ref.current, options);
      formatScoreEngravingRules(score);
      setOSMD(score);
    }

    // Try to load the XML, then render the score
    score
      .load(xml)
      .then(() => {
        score.zoom = ZOOM;
        score.render();
      })
      .finally(async () => {
        await sleep(10);

        // Format and render the cursor if it is visible and not ignored
        if (!cursor.hidden && !!osmd?.cursor) {
          renderCursor({
            userCursor: cursor,
            scoreCursor: osmd?.cursor,
            noteCount,
            index: cursor.index,
          });
        }

        // Apply a callback to each note and update the note elements
        const noteElements = getStaveNotes({
          scoreId: id,
          notes,
          classNames: props.noteClasses ?? [],
          callback: (index) => props.onNoteClick?.(cursor, index),
          useScoreIndex: "notes" in props,
        });
        setNoteElements(noteElements);

        // Apply the color to each note if specified
        const noteColor = props.noteColor ?? "fill-black";
        noteElements.forEach((elt) => {
          const id = elt.element.id;
          const heads = [
            ...document.querySelectorAll(`#${id} .vf-modifiers path`),
            ...document.querySelectorAll(`#${id} .vf-note .vf-notehead path`),
          ];
          heads.forEach((head) => head.removeAttribute("fill"));
          heads.forEach((head) => head.classList.add(noteColor));
        });
      });
  }, [
    cursor,
    id,
    xml,
    noteCount,
    props.onNoteClick,
    props.noteClasses,
    props.noteColor,
  ]);

  // Return the score, cursor, and notes
  return useMemo<ScoreProps>(
    () => ({
      score: <div ref={ref} id={id} className={className}></div>,
      osmd,
      cursor,
      scoreNotes: noteElements,
    }),
    [id, className, cursor, noteElements]
  );
}

// ------------------------------------------------------------
// OSMD Cursor
// ------------------------------------------------------------

/** The cursor contains various methods for score navigation. */
export interface CursorProps {
  index: number;
  setIndex: (index: number) => void;
  hidden: boolean;
  show: (index?: number) => void;
  hide: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  skipStart: () => void;
  skipEnd: () => void;
}

/** Render the user and score cursor independently as the score is rendered. */
function renderCursor(props: {
  scoreCursor?: Cursor;
  userCursor?: CursorProps;
  noteCount: number;
  index: number;
}) {
  const { userCursor, scoreCursor, noteCount, index } = props;
  if (!userCursor || !scoreCursor) return;

  const height = Math.round(120 * ZOOM);
  scoreCursor.cursorElement.style.height = `${height}px`;
  scoreCursor.cursorElement.style.backgroundColor = "turquoise";
  scoreCursor.cursorElement.style.opacity = "0.5";

  // Update the indices
  userCursor.setIndex(index);
  scoreCursor.reset();
  for (let i = 0; i < index; i++) scoreCursor.next();

  // Update the visibility
  if (noteCount > 0) {
    scoreCursor.show();
    userCursor.show();
  } else {
    scoreCursor.hide();
    userCursor.hide();
  }
}

/** The cursor hook returns a reference to the cursor element and its methods. */
function useOSMDCursor(osmd?: OSMD, noteCount = 1): CursorProps {
  const element = useMemo(() => osmd?.cursor, [osmd]) as Cursor | undefined;
  const [hidden, setHidden] = useState(true);
  const [index, _setIndex] = useState(0);
  const setIndex = (i: number) => _setIndex(clamp(i, 0, noteCount - 1));

  /** Show the cursor. */
  const show = useCallback(
    (index?: number) => {
      if (index !== undefined) setIndex(index);
      if (!hidden) return;
      setHidden(false);
      if (element) element.show();
    },
    [hidden]
  );

  /** Hide the cursor. */
  const hide = useCallback(() => {
    if (hidden) return;
    setHidden(true);
    if (element) element.hide();
  }, [hidden]);

  /** Toggle the cursor. */
  const toggle = useCallback(() => (hidden ? show() : hide()), [hidden]);

  /** Move the cursor to the next note. */
  const next = useCallback(() => {
    setIndex(index + 1);
    if (element) element.next();
  }, [index]);

  /** Move the cursor to the previous note. */
  const prev = useCallback(() => {
    setIndex(index - 1);
    if (element) element.previous();
  }, [index]);

  /** Move the cursor to the start of the score. */
  const skipStart = useCallback(() => {
    setIndex(0);
  }, []);

  /** Move the cursor to the end of the score. */
  const skipEnd = useCallback(() => {
    setIndex(noteCount - 1);
  }, [noteCount]);

  return useMemo<CursorProps>(
    () => ({
      element,
      index,
      setIndex,
      hidden,
      show,
      hide,
      toggle,
      next,
      prev,
      skipStart,
      skipEnd,
    }),
    [element, index, hidden, show, hide, toggle, next, prev, skipStart, skipEnd]
  );
}

// ------------------------------------------------------------
// OSMD Notes
// ------------------------------------------------------------

/** Each note specifies its index in the score and the stream. */
interface NoteProps {
  element: Element;
  scoreIndex: number;
  streamIndex: number;
}

/** The note callback accepts a cursor and stream index. */
export type NoteCallback = (cursor: CursorProps, index: number) => void;

interface StaveNoteProps {
  scoreId?: string;
  notes: NoteList;
  classNames: string[];
  callback: (index: number) => void;
  useScoreIndex?: boolean;
}

/** Get the list of stave notes in the document with the callback. */
export function getStaveNotes({
  scoreId,
  notes,
  classNames,
  callback,
  useScoreIndex,
}: StaveNoteProps) {
  // Get all stave notes in the document
  const noteElements: NoteProps[] = [];
  const streamIndices = getStreamIndices(notes);
  const score = scoreId ? document.getElementById(scoreId) : null;
  const staveNotes = score ? [...score.querySelectorAll(`.vf-stavenote`)] : [];

  // Iterate through each note and handle its element
  staveNotes.forEach((staveNote, scoreIndex) => {
    // Get the corresponding stream index
    const streamIndex = streamIndices[scoreIndex];

    // Add a callback to each stave note
    staveNote.classList.add(...["relative", ...classNames]);
    staveNote.addEventListener("click", () =>
      callback?.(useScoreIndex ? mod(scoreIndex, notes.length) : streamIndex)
    );

    // Add the element and indices to the note elements
    const note = { element: staveNote, scoreIndex, streamIndex };
    noteElements.push(note);
  });

  // Return the list of note elements
  return noteElements;
}

/** Select the score from the notes and return their corresponding stream indices. */
function getStreamIndices(notes: NoteList) {
  const elements = [...document.querySelectorAll(`.vf-clef, .vf-stavenote`)];
  const clefIndices = getStreamIndicesByClef(notes);
  const systems = [] as number[][];

  // Initialize loop variables
  const system = [] as number[];
  let onBassClef = false;
  let noteIndex = 0;
  let noteCount = 0;

  // Iterate over all clefs and notes
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const isClef = element.classList.contains("vf-clef");

    // If the element is a clef, reset the note index and switch clefs
    if (isClef) {
      if (i === 0) continue;

      // If on the bass clef, add the previous system and clear the clefs
      if (onBassClef) {
        systems.push([...system]);
        noteCount += noteIndex;
        system.clear();
      }

      // Switch clefs and reset the note index
      onBassClef = !onBassClef;
      noteIndex = 0;
      continue;
    }

    // Otherwise, add the note according to its clef
    const index = noteCount + noteIndex;
    const inTreble = clefIndices.treble.includes(index);
    const inBass = clefIndices.bass.includes(index);
    if (!onBassClef && inTreble) noteIndex++;
    else if (onBassClef && inBass) noteIndex++;
    else if (inTreble || inBass) noteIndex++;

    system.push(index);
  }

  // Add the last system and return the indices
  systems.push([...system]);
  const clefs = systems.flat();
  const indices = clefs.flat();
  return indices;
}

/** Organize a list of notes into clef and treble indices. */
function getStreamIndicesByClef(notes: NoteList) {
  const grouped = { treble: [] as number[], bass: [] as number[] };

  // Iterate over each note
  notes.forEach((chord, i) => {
    if (!isPatternMidiChord(chord)) {
      grouped.treble.push(i);
      grouped.bass.push(i);
      return;
    }

    const notes = getPatternMidiChordNotes(chord);

    // Filter the chord into treble and bass notes
    const trebleNotes = notes.filter((note) => note.MIDI >= 58);
    const bassNotes = notes.filter((note) => note.MIDI < 58);

    // Add the index to the correct clef
    if (trebleNotes.length > 0 && bassNotes.length > 0) {
      grouped.treble.push(i);
      grouped.bass.push(i);
    } else if (trebleNotes.length > 0 && bassNotes.length === 0) {
      grouped.treble.push(i);
    } else if (bassNotes.length > 0 && trebleNotes.length === 0) {
      grouped.bass.push(i);
    }
  });

  // Return the grouped indices
  return grouped;
}
