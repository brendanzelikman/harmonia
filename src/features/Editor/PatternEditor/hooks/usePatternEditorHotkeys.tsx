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
  clearPattern,
  createPattern,
  downloadPatternAsXML,
  playPattern,
} from "types/Pattern/PatternThunks";
import { transposePattern } from "types/Pattern/thunks/PatternPitchThunks";
import { useAuth } from "providers/auth";
import { Thunk } from "types/Project/ProjectTypes";
import { capitalize, noop } from "lodash";
import { Pattern } from "types/Pattern/PatternTypes";
import { CursorProps } from "lib/opensheetmusicdisplay";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { ScaleId } from "types/Scale/ScaleTypes";

export function usePatternEditorHotkeys(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, cursor, onBlockClick, onRestClick } = props;

  // Pattern Hotkeys
  useHotkeysInEditor(dispatch(PLAY_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(DUPLICATE_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(CLEAR_PATTERN_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(EXPORT_PATTERN_MIDI_HOTKEY(pattern)));
  useHotkeysInEditor(dispatch(EXPORT_PATTERN_XML_HOTKEY(pattern)));

  // Action Hotkeys
  useHotkeysInEditor(dispatch(TOGGLE_PATTERN_ADD_HOTKEY(props.isCustom)));
  useHotkeysInEditor(dispatch(REMOVE_PATTERN_NOTE_HOTKEY(props.onEraseClick)));
  useHotkeysInEditor(dispatch(TOGGLE_PATTERN_ANCHOR_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(PATTERN_NOTE_CLICK_HOTKEY(onBlockClick)));
  useHotkeysInEditor(dispatch(PATTERN_REST_CLICK_HOTKEY(onRestClick)));

  // Duration Hotkeys
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("1")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("2")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("3")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("4")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("5")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("6")));
  useHotkeysInEditor(dispatch(SELECT_PATTERN_DURATION_HOTKEY("7")));
  useHotkeysInEditor(dispatch(TOGGLE_PATTERN_DOTTED_HOTKEY()));
  useHotkeysInEditor(dispatch(TOGGLE_PATTERN_TRIPLET_HOTKEY()));

  // Cursor Hotkeys
  const showCursor = !!props.isCustom && !!pattern?.stream?.length;
  useHotkeysInEditor(
    dispatch(TOGGLE_PATTERN_CURSOR_HOTKEY(cursor, showCursor))
  );
  useHotkeysInEditor(dispatch(MOVE_PATTERN_CURSOR_LEFT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(MOVE_PATTERN_CURSOR_RIGHT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(SKIP_PATTERN_LEFT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(SKIP_PATTERN_RIGHT_HOTKEY(cursor)));

  // Transform Hotkeys
  useHotkeysInEditor(dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, 1)));
  useHotkeysInEditor(dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, -1)));
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, 1, "q"))
  );
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, -1, "q"))
  );
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, 1, "w"))
  );
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, -1, "w"))
  );
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, 1, "e"))
  );
  useHotkeysInEditor(
    dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, -1, "e"))
  );
  useHotkeysInEditor(dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, 12)));
  useHotkeysInEditor(dispatch(TRANSPOSE_PATTERN_HOTKEY(pattern, cursor, -12)));
}

// ------------------------------------------------------------
// Pattern Hotkeys
// ------------------------------------------------------------

export const PLAY_PATTERN_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Play Pattern",
    description: "Hear a preview of the pattern.",
    shortcut: "shift+space",
    callback: () => pattern && dispatch(playPattern(pattern)),
  });

export const DUPLICATE_PATTERN_HOTKEY =
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

export const CLEAR_PATTERN_HOTKEY =
  (pattern?: Pattern): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Clear Pattern",
    description: "Remove all notes from the pattern.",
    shortcut: "shift+backspace",
    callback: () => pattern && dispatch(clearPattern(pattern.id)),
  });

export const EXPORT_PATTERN_MIDI_HOTKEY =
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

export const EXPORT_PATTERN_XML_HOTKEY =
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

export const TOGGLE_PATTERN_ADD_HOTKEY =
  (isCustom = false): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Adding Notes",
    description: "Start or stop adding notes to the pattern.",
    shortcut: "a",
    callback: () =>
      isCustom && dispatch(toggleEditorAction({ data: "addingNotes" })),
  });

export const REMOVE_PATTERN_NOTE_HOTKEY =
  (onEraseClick: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Remove Last/Selected Note",
    description: "Remove the last note or the note at the cursor.",
    shortcut: "backspace",
    callback: onEraseClick,
  });

export const TOGGLE_PATTERN_ANCHOR_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Anchor Selected Note",
    description: "Toggle the anchor for inserting notes.",
    shortcut: "x",
    callback: () =>
      !cursor?.hidden &&
      dispatch(toggleEditorAction({ data: "insertingNotes" })),
  });

export const PATTERN_NOTE_CLICK_HOTKEY =
  (onBlockClick: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Input Pattern Note",
    description: "Input a note with the selected duration.",
    shortcut: "n",
    callback: onBlockClick,
  });

export const PATTERN_REST_CLICK_HOTKEY =
  (onRestClick: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Input Pattern Rest",
    description: "Input a rest with the selected duration.",
    shortcut: "0",
    callback: onRestClick,
  });

// ------------------------------------------------------------
// Cursor Hotkeys
// ------------------------------------------------------------

export const TOGGLE_PATTERN_CURSOR_HOTKEY =
  (cursor?: CursorProps, isCustom = false): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Cursor",
    description: "Show or hide the cursor.",
    shortcut: "c",
    callback: () => (isCustom ? cursor?.toggle() : cursor?.hide()),
  });

export const MOVE_PATTERN_CURSOR_LEFT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Move Cursor Left",
    description: "Move the cursor to the previous note.",
    shortcut: "left",
    callback: () => cursor?.prev(),
  });

export const MOVE_PATTERN_CURSOR_RIGHT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Move Cursor Right",
    description: "Move the cursor to the next note.",
    shortcut: "right",
    callback: () => cursor?.next(),
  });

export const SKIP_PATTERN_LEFT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip to Start",
    description: "Move the cursor to the start of the pattern.",
    shortcut: "shift+left",
    callback: () => cursor?.skipStart(),
  });

export const SKIP_PATTERN_RIGHT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip to End",
    description: "Move the cursor to the end of the pattern.",
    shortcut: "shift+right",
    callback: () => cursor?.skipEnd(),
  });

// ------------------------------------------------------------
// Duration Hotkeys
// ------------------------------------------------------------

export const SELECT_PATTERN_DURATION_HOTKEY =
  (shortcut?: string): Thunk<Hotkey> =>
  (dispatch) => {
    const data =
      shortcut === "1"
        ? "whole"
        : shortcut === "2"
        ? "half"
        : shortcut === "3"
        ? "quarter"
        : shortcut === "4"
        ? "eighth"
        : shortcut === "5"
        ? "16th"
        : shortcut === "6"
        ? "32nd"
        : shortcut === "7"
        ? "64th"
        : "1 to 7";
    const noData = data === "1 to 7";
    return {
      name: shortcut
        ? `Select ${capitalize(data)} Note`
        : "Select Note Duration",
      description: `Select a ${data} note duration.`,
      shortcut: shortcut || "1 to 7",
      callback: () => !noData && dispatch(setEditorNoteDuration({ data })),
    };
  };

export const TOGGLE_PATTERN_DOTTED_HOTKEY =
  (): Thunk<Hotkey> => (dispatch) => ({
    name: "Toggle Dotted Note",
    description: "Switch between a dotted and regular note.",
    shortcut: ".",
    callback: () => dispatch(toggleEditorDottedDuration()),
  });

export const TOGGLE_PATTERN_TRIPLET_HOTKEY =
  (): Thunk<Hotkey> => (dispatch) => ({
    name: "Toggle Triplet Note",
    description: "Switch between a triplet and regular note.",
    shortcut: "t",
    callback: () => dispatch(toggleEditorTripletDuration()),
  });

// ------------------------------------------------------------
// Transform Hotkeys
// ------------------------------------------------------------

export const TRANSPOSE_PATTERN_HOTKEY =
  (
    pattern?: Pattern,
    cursor?: CursorProps,
    steps = 1,
    key?: "q" | "w" | "e"
  ): Thunk<Hotkey> =>
  (dispatch, getProject) => {
    const shortcut = steps > 0 ? "up" : "down";
    return {
      name: `Transpose ${capitalize(shortcut)}`,
      description: `Transpose ${shortcut} 1 ${key ? "scale " : "semi"}tone.`,
      shortcut: key
        ? `${key}+${shortcut}`
        : Math.abs(steps) === 1
        ? `t+${shortcut}`
        : `shift+${shortcut}`,
      callback: () => {
        if (!pattern || !cursor) return;
        const { id } = pattern;
        const { index } = cursor;
        let scaleId: ScaleId | undefined = undefined;
        if (key) {
          const project = getProject();
          const chain = selectTrackScaleChain(project, pattern.trackId);
          const scale =
            key === "q"
              ? chain[0]
              : key === "w"
              ? chain[1]
              : key === "e"
              ? chain[2]
              : undefined;
          if (scale) scaleId = scale.id;
        }
        if (!cursor.hidden) {
          dispatch(
            transposePatternBlock({ id, index, transpose: steps, scaleId })
          );
        } else {
          dispatch(
            transposePattern({ data: { id, transpose: steps, scaleId } })
          );
        }
      },
    };
  };

export const PATTERN_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(TOGGLE_PATTERN_ADD_HOTKEY()),
  dispatch(TOGGLE_PATTERN_CURSOR_HOTKEY()),
  dispatch(MOVE_PATTERN_CURSOR_LEFT_HOTKEY()),
  dispatch(MOVE_PATTERN_CURSOR_RIGHT_HOTKEY()),
  dispatch(TOGGLE_PATTERN_ANCHOR_HOTKEY()),
  dispatch(REMOVE_PATTERN_NOTE_HOTKEY()),
  dispatch(CLEAR_PATTERN_HOTKEY()),
  dispatch(PLAY_PATTERN_HOTKEY()),
  dispatch(SELECT_PATTERN_DURATION_HOTKEY()),
  dispatch(PATTERN_REST_CLICK_HOTKEY()),
  dispatch(PATTERN_NOTE_CLICK_HOTKEY()),
  dispatch(TOGGLE_PATTERN_TRIPLET_HOTKEY()),
  dispatch(TOGGLE_PATTERN_DOTTED_HOTKEY()),
];
