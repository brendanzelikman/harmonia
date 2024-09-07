import { promptUserForNumber } from "utils/html";
import { Hotkey, useHotkeysInEditor } from "lib/react-hotkeys-hook";
import { PatternEditorProps } from "../PatternEditor";
import {
  setEditorNoteDuration,
  toggleEditorAction,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
} from "types/Editor/EditorSlice";
import { useProjectDispatch } from "types/hooks";
import { transposePatternBlock } from "types/Pattern/PatternSlice";
import { exportPatternToMIDI } from "types/Pattern/PatternExporters";
import {
  repeatPattern,
  continuePattern,
  stretchPattern,
} from "types/Pattern/thunks/PatternDurationThunks";
import {
  clearPattern,
  createPattern,
  downloadPatternAsXML,
  playPattern,
} from "types/Pattern/PatternThunks";
import { transposePattern } from "types/Pattern/thunks/PatternPitchThunks";
import { useAuth } from "providers/auth";
import { Thunk } from "types/Project/ProjectTypes";
import { capitalize } from "lodash";
import { Pattern } from "types/Pattern/PatternTypes";
import { CursorProps } from "lib/opensheetmusicdisplay";

export function usePatternEditorHotkeys(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, cursor, onBlockClick, onRestClick } = props;

  // Pattern Hotkeys
  useHotkeysInEditor(dispatch(PLAY_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(DUPLICATE_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(CLEAR_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(EXPORT_MIDI_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(EXPORT_XML_HOTKEY(pattern)));

  // Action Hotkeys
  useHotkeysInEditor(dispatch(TOGGLE_ADDING_HOTKEY(props.isCustom)));
  useHotkeysInEditor(dispatch(REMOVE_NOTE_HOTKEY(props.onEraseClick)));
  useHotkeysInEditor(dispatch(TOGGLE_ANCHOR_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(NOTE_CLICK_HOTKEY(onBlockClick)));
  useHotkeysInEditor(dispatch(REST_CLICK_HOTKEY(onRestClick)));

  // Duration Hotkeys
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("1")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("2")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("3")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("4")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("5")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("6")));
  useHotkeysInEditor(dispatch(SELECT_DURATION_HOTKEY("7")));
  useHotkeysInEditor(dispatch(TOGGLE_DOTTED_HOTKEY()));
  useHotkeysInEditor(dispatch(TOGGLE_TRIPLET_HOTKEY()));

  // Cursor Hotkeys
  const showCursor = !!props.isCustom && !!pattern?.stream?.length;
  useHotkeysInEditor(dispatch(TOGGLE_CURSOR_HOTKEY(cursor, showCursor)));
  useHotkeysInEditor(dispatch(MOVE_LEFT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(MOVE_RIGHT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(SKIP_LEFT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(SKIP_RIGHT_HOTKEY(cursor)));

  // Transform Hotkeys
  useHotkeysInEditor(dispatch(TRANSPOSE_HOTKEY(pattern, cursor, 1)));
  useHotkeysInEditor(dispatch(TRANSPOSE_HOTKEY(pattern, cursor, -1)));
  useHotkeysInEditor(dispatch(TRANSPOSE_HOTKEY(pattern, cursor, 12)));
  useHotkeysInEditor(dispatch(TRANSPOSE_HOTKEY(pattern, cursor, -12)));
  useHotkeysInEditor(dispatch(REPEAT_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(EXTEND_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(DIMINISH_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(AUGMENT_HOTKEY(pattern)));
}

// ------------------------------------------------------------
// Pattern Hotkeys
// ------------------------------------------------------------

const PLAY_PATTERN_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Play Pattern",
    description: "Hear a preview of the pattern.",
    shortcut: "shift+space",
    callback: () => pattern && dispatch(playPattern(pattern)),
  });

const DUPLICATE_PATTERN_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Duplicate Pattern",
    description: "Create a copy of the pattern.",
    shortcut: "meta+d",
    callback: () =>
      pattern &&
      dispatch(
        createPattern({ data: { ...pattern, name: `${pattern?.name} Copy` } })
      ),
  });

const CLEAR_PATTERN_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Clear Pattern",
    description: "Remove all notes from the pattern.",
    shortcut: "shift+backspace",
    callback: () => pattern && dispatch(clearPattern(pattern.id)),
  });

const EXPORT_MIDI_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => {
    const { isProdigy } = useAuth();
    return {
      name: "Export Pattern to MIDI",
      description: "Export the pattern to a MIDI file.",
      shortcut: "shift+m",
      callback: () => !isProdigy && dispatch(exportPatternToMIDI(pattern?.id)),
    };
  };

const EXPORT_XML_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => {
    const { isProdigy } = useAuth();
    return {
      name: "Export Pattern to XML",
      description: "Export the pattern to an XML file.",
      shortcut: "shift+x",
      callback: () => !isProdigy && dispatch(downloadPatternAsXML(pattern?.id)),
    };
  };

// ------------------------------------------------------------
// Action Hotkeys
// ------------------------------------------------------------

const TOGGLE_ADDING_HOTKEY =
  (isCustom = false): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Adding Notes",
    description: "Start or stop adding notes to the pattern.",
    shortcut: "a",
    callback: () =>
      isCustom && dispatch(toggleEditorAction({ data: "addingNotes" })),
  });

const REMOVE_NOTE_HOTKEY =
  (onEraseClick: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Remove Note",
    description: "Remove the last note or the note at the cursor.",
    shortcut: "backspace",
    callback: onEraseClick,
  });

const TOGGLE_ANCHOR_HOTKEY =
  (cursor: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Anchor",
    description: "Toggle the anchor for inserting notes.",
    shortcut: "x",
    callback: () =>
      !cursor.hidden &&
      dispatch(toggleEditorAction({ data: "insertingNotes" })),
  });

const NOTE_CLICK_HOTKEY =
  (onBlockClick: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Note Click",
    description: "Input a note with the selected duration.",
    shortcut: "n",
    callback: onBlockClick,
  });

const REST_CLICK_HOTKEY =
  (onRestClick: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Rest Click",
    description: "Input a rest with the selected duration.",
    shortcut: "0",
    callback: onRestClick,
  });

// ------------------------------------------------------------
// Cursor Hotkeys
// ------------------------------------------------------------

const TOGGLE_CURSOR_HOTKEY =
  (cursor: CursorProps, isCustom = false): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Cursor",
    description: "Show or hide the cursor.",
    shortcut: "c",
    callback: () => (isCustom ? cursor.toggle() : cursor.hide()),
  });

const MOVE_LEFT_HOTKEY =
  (cursor: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Move Left",
    description: "Move the cursor to the previous note.",
    shortcut: "left",
    callback: () => cursor.prev(),
  });

const MOVE_RIGHT_HOTKEY =
  (cursor: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Move Right",
    description: "Move the cursor to the next note.",
    shortcut: "right",
    callback: () => cursor.next(),
  });

const SKIP_LEFT_HOTKEY =
  (cursor: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip to Start",
    description: "Move the cursor to the start of the pattern.",
    shortcut: "shift+left",
    callback: () => cursor.skipStart(),
  });

const SKIP_RIGHT_HOTKEY =
  (cursor: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip to End",
    description: "Move the cursor to the end of the pattern.",
    shortcut: "shift+right",
    callback: () => cursor.skipEnd(),
  });

// ------------------------------------------------------------
// Duration Hotkeys
// ------------------------------------------------------------

const SELECT_DURATION_HOTKEY =
  (key: string): Thunk<Hotkey> =>
  (dispatch) => {
    const data =
      key === "1"
        ? "whole"
        : key === "2"
        ? "half"
        : key === "3"
        ? "quarter"
        : key === "4"
        ? "eighth"
        : key === "5"
        ? "16th"
        : key === "6"
        ? "32nd"
        : "64th";
    return {
      name: `Select ${capitalize(data)} Note`,
      description: "Select a whole note duration.",
      shortcut: "1",
      callback: () => dispatch(setEditorNoteDuration({ data })),
    };
  };

const TOGGLE_DOTTED_HOTKEY = (): Thunk<Hotkey> => (dispatch) => ({
  name: "Toggle Dotted Note",
  description: "Switch between a dotted and regular note.",
  shortcut: ".",
  callback: () => dispatch(toggleEditorDottedDuration()),
});

const TOGGLE_TRIPLET_HOTKEY = (): Thunk<Hotkey> => (dispatch) => ({
  name: "Toggle Triplet Note",
  description: "Switch between a triplet and regular note.",
  shortcut: "t",
  callback: () => dispatch(toggleEditorTripletDuration()),
});

// ------------------------------------------------------------
// Transform Hotkeys
// ------------------------------------------------------------

const TRANSPOSE_HOTKEY =
  (pattern?: Pattern, cursor?: CursorProps, steps = 1): Thunk<Hotkey> =>
  (dispatch) => {
    const shortcut = steps > 0 ? "up" : "down";
    return {
      name: `Transpose ${capitalize(shortcut)}`,
      description: `Transpose ${shortcut} 1 semitone.`,
      shortcut: Math.abs(steps) === 1 ? shortcut : `shift+${shortcut}`,
      callback: () => {
        if (!pattern || !cursor) return;
        const { id } = pattern;
        const { index } = cursor;
        if (!cursor.hidden) {
          dispatch(transposePatternBlock({ id, index, transpose: 1 }));
        } else {
          dispatch(transposePattern({ data: { id, transpose: 1 } }));
        }
      },
    };
  };

const REPEAT_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Repeat Pattern",
    description: "Prompt for repeating the pattern.",
    shortcut: "r",
    callback: promptUserForNumber(
      "Repeat Your Pattern",
      "How many times would you like to repeat your pattern?",
      (n) =>
        pattern &&
        dispatch(repeatPattern({ data: { id: pattern.id, repeat: n } }))
    ),
  });

const EXTEND_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Extend Pattern",
    description: "Extend the duration of the pattern to a certain length.",
    shortcut: ",",
    callback: promptUserForNumber(
      "Extend Your Pattern",
      "How many notes would you like to extend your stream to?",
      (n) =>
        pattern &&
        dispatch(continuePattern({ data: { id: pattern.id, length: n } }))
    ),
  });

const DIMINISH_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Diminish Pattern",
    description: "Halve the duration of the pattern.",
    shortcut: "meta+-",
    callback: () =>
      pattern &&
      dispatch(stretchPattern({ data: { id: pattern.id, factor: 0.5 } })),
  });

const AUGMENT_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Augment Pattern",
    description: "Double the duration of the pattern.",
    shortcut: "meta+=",
    callback: () =>
      pattern &&
      dispatch(stretchPattern({ data: { id: pattern.id, factor: 2 } })),
  });
