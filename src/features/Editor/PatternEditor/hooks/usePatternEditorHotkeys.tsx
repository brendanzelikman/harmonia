import { promptUserForNumber } from "utils/html";
import { useOverridingHotkeys, useScopedHotkeys } from "lib/react-hotkeys-hook";
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

const useHotkeys = useScopedHotkeys("editor");

export function usePatternEditorHotkeys(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { isProdigy } = useAuth();
  const { pattern, cursor } = props;
  const id = pattern?.id;
  const index = cursor.index;

  // N = Note Click
  useHotkeys("n", props.onBlockClick, [props.onBlockClick]);

  // 0 = Rest Click
  useHotkeys("0", props.onRestClick, [props.onRestClick]);

  // 1 = Select Whole Note
  useHotkeys("1", () => dispatch(setEditorNoteDuration({ data: "whole" })));

  // 2 = Select Half Note
  useHotkeys("2", () => dispatch(setEditorNoteDuration({ data: "half" })));

  // 3 = Select Quarter Note
  useHotkeys("3", () => dispatch(setEditorNoteDuration({ data: "quarter" })));

  // 4 = Select Eighth Note
  useHotkeys("4", () => dispatch(setEditorNoteDuration({ data: "eighth" })));

  // 5 = Select 16th Note
  useHotkeys("5", () => dispatch(setEditorNoteDuration({ data: "16th" })));

  // 6 = Select 32nd Note
  useHotkeys("6", () => dispatch(setEditorNoteDuration({ data: "32nd" })));

  // 7 = Select 64th Note
  useHotkeys("7", () => dispatch(setEditorNoteDuration({ data: "64th" })));

  // A = Start/Stop Adding Notes
  useHotkeys(
    "a",
    () =>
      props.isCustom && dispatch(toggleEditorAction({ data: "addingNotes" })),
    [props.isCustom]
  );

  // Backspace = Remove Note if Showing Cursor
  useHotkeys("backspace", props.onEraseClick, [props.onEraseClick]);

  // Shift + Backspace = Clear Pattern
  useHotkeys("shift+backspace", () => id && dispatch(clearPattern(id)), [id]);

  // . = Toggle Dotted Note
  useHotkeys(".", () => dispatch(toggleEditorDottedDuration()), []);

  // t = Toggle Triplet Note
  useHotkeys("t", () => dispatch(toggleEditorTripletDuration()), []);

  // Meta + D = Duplicate Pattern
  useHotkeys(
    "meta+d",
    () =>
      pattern &&
      dispatch(
        createPattern({ data: { ...pattern, name: `${pattern?.name} Copy` } })
      ),
    [pattern]
  );

  // C = Toggle Cursor
  useHotkeys(
    "c",
    props.isCustom && pattern?.stream?.length ? cursor.toggle : () => null,
    [pattern, props.isCustom, cursor.toggle]
  );

  // X = Toggle Anchor
  useHotkeys(
    "x",
    () =>
      !cursor.hidden &&
      dispatch(toggleEditorAction({ data: "insertingNotes" })),
    [cursor.hidden]
  );

  // Shift + Left Arrow = Skip Cursor Left
  useHotkeys("shift+left", () => cursor.skipStart, [cursor]);

  // Shift + Right Arrow = Skip Cursor Right
  useHotkeys("shift+right", () => cursor.skipEnd, [cursor]);

  // Up Arrow = Transpose Up 1 Step
  useHotkeys(
    "up",
    () => {
      if (!id) return;
      if (cursor.hidden) {
        dispatch(transposePattern({ data: { id, transpose: 1 } }));
      } else {
        dispatch(transposePatternBlock({ id, index, transpose: 1 }));
      }
    },
    [id, index, cursor.hidden]
  );

  // Shift + Up Arrow = Transpose Up 1 Octave
  useHotkeys(
    "shift+up",
    () => {
      if (!id) return;
      if (cursor.hidden) {
        dispatch(transposePattern({ data: { id, transpose: 12 } }));
      } else {
        dispatch(transposePatternBlock({ id, index, transpose: 12 }));
      }
    },
    [id, index, cursor.hidden]
  );

  // Down Arrow = Transpose Down 1 Step
  useHotkeys(
    "down",
    () => {
      if (!id) return;
      if (cursor.hidden) {
        dispatch(transposePattern({ data: { id, transpose: -1 } }));
      } else {
        dispatch(transposePatternBlock({ id, index, transpose: -1 }));
      }
    },
    [id, index, cursor.hidden]
  );

  // Shift + Down Arrow = Transpose Down 1 Octave
  useHotkeys(
    "shift+down",
    () => {
      if (!id) return;
      if (cursor.hidden) {
        dispatch(transposePattern({ data: { id, transpose: -12 } }));
      } else {
        dispatch(transposePatternBlock({ id, index, transpose: -12 }));
      }
    },
    [id, index, cursor.hidden]
  );

  // Left Arrow = Move Cursor Left
  useHotkeys("left", cursor.prev, [cursor]);

  // Right Arrow = Move Cursor Right
  useHotkeys("right", cursor.next, [cursor]);

  // X = Export Pattern to XML
  useHotkeys(
    "shift+x",
    () => !isProdigy && pattern && dispatch(downloadPatternAsXML(id)),
    [isProdigy, pattern]
  );

  // M = Export Pattern to MIDI
  useHotkeys(
    "shift+m",
    () => !isProdigy && id && dispatch(exportPatternToMIDI(id)),
    [isProdigy, id]
  );

  // R = Prompt for repeat
  useHotkeys(
    "r",
    !props.isCustom
      ? () => null
      : promptUserForNumber(
          "Repeat Your Pattern",
          "How many times would you like to repeat your pattern?",
          (n) => {
            if (id) dispatch(repeatPattern({ data: { id, repeat: n } }));
          }
        ),
    [id, props.isCustom]
  );

  // , = Continue Pattern
  useHotkeys(
    "comma",
    !props.isCustom
      ? () => null
      : promptUserForNumber(
          "Continue Your Pattern",
          "How many notes would you like to continue your pattern for?",
          (n) => {
            if (id) dispatch(continuePattern({ data: { id, length: n } }));
          }
        ),
    [props.isCustom, id]
  );

  // Meta + "-" = Diminish Pattern
  useHotkeys(
    "meta+minus",
    () => id && dispatch(stretchPattern({ data: { id, factor: 0.5 } })),
    { preventDefault: true },
    [id]
  );

  // Meta + "=" = Augment Pattern
  useOverridingHotkeys(
    "meta+equal",
    () => id && dispatch(stretchPattern({ data: { id, factor: 2 } })),
    { preventDefault: true },
    [id]
  );

  // Shift + Space = Play Pattern
  useHotkeys("shift+space", () => pattern && dispatch(playPattern(pattern)), [
    pattern,
  ]);
}
