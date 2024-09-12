import { ScaleEditorProps } from "../ScaleEditor";
import { promptUserForNumber } from "utils/html";
import { Hotkey, useHotkeysInEditor } from "lib/react-hotkeys-hook";
import { useProjectDispatch } from "types/hooks";
import { toggleEditorAction } from "types/Editor/EditorSlice";
import {
  playScale,
  clearScale,
  transposeScale,
  rotateScale,
} from "types/Scale/ScaleThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { ScaleObject } from "types/Scale/ScaleTypes";
import { CursorProps } from "lib/opensheetmusicdisplay";

export function useScaleEditorHotkeys(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { scale, cursor } = props;

  // Scale Hotkeys
  useHotkeysInEditor(dispatch(PLAY_SCALE_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(CLEAR_SCALE_HOTKEY(scale)));

  // Action Hotkeys
  useHotkeysInEditor(dispatch(TOGGLE_SCALE_ADD_HOTKEY()));
  useHotkeysInEditor(dispatch(TOGGLE_SCALE_REMOVE_HOTKEY()));
  useHotkeysInEditor(dispatch(TOGGLE_SCALE_CURSOR_HOTKEY(scale, cursor)));
  useHotkeysInEditor(dispatch(SKIP_SCALE_LEFT_HOTKEY(cursor)));
  useHotkeysInEditor(dispatch(SKIP_SCALE_RIGHT_HOTKEY(cursor)));

  // Transpose Hotkeys
  useHotkeysInEditor(dispatch(TRANSPOSE_SCALE_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(TRANSPOSE_SCALE_UP_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(TRANSPOSE_SCALE_DOWN_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(OCTAVE_SCALE_UP_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(OCTAVE_SCALE_DOWN_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(ROTATE_SCALE_HOTKEY(scale)));
  useHotkeysInEditor(dispatch(ROTATE_SCALE_UP_HOTKEY(scale, cursor)));
  useHotkeysInEditor(dispatch(ROTATE_SCALE_DOWN_HOTKEY(scale, cursor)));
}

// ------------------------------------------------------------
// Scale Hotkeys
// ------------------------------------------------------------

export const PLAY_SCALE_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch, getProject) => ({
    name: "Play Scale",
    description: "Play the current scale.",
    shortcut: "shift+space",
    callback: () => scale && dispatch(playScale(scale)),
  });

export const CLEAR_SCALE_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Clear Scale",
    description: "Clear the current scale.",
    shortcut: "shift+backspace",
    callback: () => scale && dispatch(clearScale(scale.id)),
  });

// ------------------------------------------------------------
// Action Hotkeys
// ------------------------------------------------------------

export const TOGGLE_SCALE_ADD_HOTKEY = (): Thunk<Hotkey> => (dispatch) => ({
  name: "Start/Stop Adding Notes",
  description: "Toggle adding notes to the scale.",
  shortcut: "a",
  callback: () => dispatch(toggleEditorAction({ data: "addingNotes" })),
});

export const TOGGLE_SCALE_REMOVE_HOTKEY = (): Thunk<Hotkey> => (dispatch) => ({
  name: "Start/Stop Removing Notes",
  description: "Toggle removing notes from the scale.",
  shortcut: "backspace",
  callback: () => dispatch(toggleEditorAction({ data: "removingNotes" })),
});

export const TOGGLE_SCALE_CURSOR_HOTKEY =
  (scale?: ScaleObject, cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Cursor",
    description: "Toggle the cursor on the scale.",
    shortcut: "c",
    callback: () => (scale?.notes.length ? cursor?.toggle() : null),
  });

export const SKIP_SCALE_LEFT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip Left",
    description: "Skip the cursor to the left.",
    shortcut: "shift+left",
    callback: () =>
      cursor !== undefined && !cursor.hidden && cursor.skipStart(),
  });

export const SKIP_SCALE_RIGHT_HOTKEY =
  (cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Skip Right",
    description: "Skip the cursor to the right.",
    shortcut: "shift+right",
    callback: () => cursor !== undefined && !cursor.hidden && cursor.skipEnd(),
  });

// ------------------------------------------------------------
// Transpose Hotkeys
// ------------------------------------------------------------

export const TRANSPOSE_SCALE_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Transpose Scale",
    description: "Prompt for transposing the scale.",
    shortcut: "t",
    callback: promptUserForNumber(
      "Transpose Your Scale",
      "How many semitones would you like to transpose your scale by?",
      (n) => dispatch(transposeScale(scale, n))
    ),
  });

export const TRANSPOSE_SCALE_UP_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Transpose Up",
    description: "Transpose the scale up 1 semitone.",
    shortcut: "up",
    callback: () => dispatch(transposeScale(scale, 1)),
  });

export const TRANSPOSE_SCALE_DOWN_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Transpose Down",
    description: "Transpose the scale down 1 semitone.",
    shortcut: "down",
    callback: () => dispatch(transposeScale(scale, -1)),
  });

export const OCTAVE_SCALE_UP_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Octave Up",
    description: "Transpose the scale up 12 semitones.",
    shortcut: "shift+up",
    callback: () => dispatch(transposeScale(scale, 12)),
  });

export const OCTAVE_SCALE_DOWN_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Octave Down",
    description: "Transpose the scale down 12 semitones.",
    shortcut: "shift+down",
    callback: () => dispatch(transposeScale(scale, -12)),
  });

export const ROTATE_SCALE_HOTKEY =
  (scale?: ScaleObject): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Rotate Scale",
    description: "Prompt for rotating the scale.",
    shortcut: "r",
    callback: promptUserForNumber(
      "Rotate Your Scale",
      "How many steps would you like to rotate your scale by?",
      (n) => dispatch(rotateScale(scale, n))
    ),
  });

export const ROTATE_SCALE_UP_HOTKEY =
  (scale?: ScaleObject, cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => {
    const showCursor = cursor !== undefined && !cursor.hidden;
    if (showCursor) {
      return {
        name: "Move Right",
        description: "Move the cursor to the next note.",
        shortcut: "right",
        callback: () => cursor.next(),
      };
    } else {
      return {
        name: "Rotate Up",
        description: "Rotate the scale up 1 step.",
        shortcut: "right",
        callback: () => dispatch(rotateScale(scale, 1)),
      };
    }
  };

export const ROTATE_SCALE_DOWN_HOTKEY =
  (scale?: ScaleObject, cursor?: CursorProps): Thunk<Hotkey> =>
  (dispatch) => {
    const showCursor = cursor !== undefined && !cursor.hidden;
    if (showCursor) {
      return {
        name: "Move Left",
        description: "Move the cursor to the previous note.",
        shortcut: "left",
        callback: () => cursor.prev(),
      };
    } else {
      return {
        name: "Rotate Down",
        description: "Rotate the scale down 1 step.",
        shortcut: "left",
        callback: () => dispatch(rotateScale(scale, -1)),
      };
    }
  };

export const SCALE_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(TOGGLE_SCALE_ADD_HOTKEY()),
  dispatch(TOGGLE_SCALE_REMOVE_HOTKEY()),
  dispatch(CLEAR_SCALE_HOTKEY()),
  dispatch(PLAY_SCALE_HOTKEY()),
  dispatch(TRANSPOSE_SCALE_HOTKEY()),
  dispatch(ROTATE_SCALE_HOTKEY()),
  dispatch(TRANSPOSE_SCALE_UP_HOTKEY()),
  dispatch(TRANSPOSE_SCALE_DOWN_HOTKEY()),
  dispatch(OCTAVE_SCALE_UP_HOTKEY()),
  dispatch(OCTAVE_SCALE_DOWN_HOTKEY()),
  dispatch(ROTATE_SCALE_UP_HOTKEY()),
  dispatch(ROTATE_SCALE_DOWN_HOTKEY()),
];
