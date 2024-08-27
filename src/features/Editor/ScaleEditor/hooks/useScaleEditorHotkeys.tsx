import { ScaleEditorProps } from "../ScaleEditor";
import { promptUserForNumber } from "utils/html";
import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { useProjectDeepSelector, useProjectDispatch } from "types/hooks";
import { toggleEditorAction } from "types/Editor/EditorSlice";
import { selectTrackMidiScale } from "types/Track/TrackSelectors";
import {
  playScale,
  clearScale,
  transposeScale,
  rotateScale,
} from "types/Scale/ScaleThunks";

const useHotkeys = useScopedHotkeys("editor");

export function useScaleEditorHotkeys(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { scale, cursor } = props;
  const notes = useProjectDeepSelector(selectTrackMidiScale);

  // Shift + Space = Play Scale
  useHotkeys("shift+space", () => scale && dispatch(playScale(scale)), [scale]);

  // A = Toggle Adding Notes
  useHotkeys("a", () => dispatch(toggleEditorAction({ data: "addingNotes" })));

  // C = Toggle Cursor
  useHotkeys("c", scale?.notes.length ? cursor.toggle : () => null, [
    scale,
    cursor,
  ]);

  // Shift + Backspace = Clear Scale
  useHotkeys("shift+backspace", () => dispatch(clearScale(scale?.id)), [scale]);

  // Backspace = Toggle Removing Notes or Remove Note
  useHotkeys("backspace", () =>
    dispatch(toggleEditorAction({ data: "removingNotes" }))
  );

  // T = Prompt for Transposition
  useHotkeys(
    "shift+t",
    promptUserForNumber(
      "Transpose Your Scale",
      "How many semitones would you like to transpose your scale by?",
      (n) => dispatch(transposeScale(scale, n))
    ),
    [scale]
  );

  // R = Prompt for Rotation
  useHotkeys(
    "shift+r",
    promptUserForNumber(
      "Rotate Your Scale",
      "How many steps would you like to rotate your scale by?",
      (n) => dispatch(rotateScale(scale, n))
    ),
    [scale]
  );

  // Up Arrow = Transpose Up 1 Semitone
  useHotkeys("up", () => dispatch(transposeScale(scale, 1)), [scale]);

  // Shift + Up Arrow = Transpose Up 12 Semitones
  useHotkeys("shift+up", () => dispatch(transposeScale(scale, 12)), [scale]);

  // Down Arrow = Transpose Down 1 Semitone
  useHotkeys("down", () => dispatch(transposeScale(scale, -1)), [scale]);

  // Shift + Down Arrow = Transpose Down 12 Semitones
  useHotkeys("shift+down", () => dispatch(transposeScale(scale, -12)), [scale]);

  // Left Arrow = Rotate Down 1 Step or Rewind Cursor
  useHotkeys(
    "left",
    () => {
      if (!cursor.hidden && cursor.index > 0) {
        cursor.prev();
      } else {
        dispatch(rotateScale(scale, -1));
      }
    },
    [cursor, scale]
  );

  // Right Arrow = Rotate Up 1 Step or Advance Cursor
  useHotkeys(
    "right",
    () => {
      if (!cursor.hidden && cursor.index < notes.length - 1) {
        cursor.next();
      } else {
        dispatch(rotateScale(scale, 1));
      }
    },
    [cursor, scale, notes]
  );

  // Shift + Left Arrow = Skip Cursor Left
  useHotkeys("shift+left", () => !cursor.hidden && cursor.skipStart(), [
    cursor,
  ]);

  // Shift + Right Arrow = Skip Cursor Right
  useHotkeys("shift+right", () => !cursor.hidden && cursor.skipEnd(), [cursor]);
}
