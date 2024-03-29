import { promptUserForNumber } from "utils/html";
import { useOverridingHotkeys, useScopedHotkeys } from "lib/react-hotkeys-hook";
import { PatternEditorProps } from "../PatternEditor";
import {
  setEditorNoteDuration,
  toggleEditorAction,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
} from "redux/Editor";
import * as _ from "redux/Pattern";
import { useSubscription } from "providers/subscription";

const useHotkeys = useScopedHotkeys("editor");

export function usePatternEditorHotkeys(props: PatternEditorProps) {
  const { dispatch, undo, redo } = props;
  const { isProdigy } = useSubscription();
  const { pattern, cursor, canUndo, canRedo } = props;
  const id = pattern?.id;
  const index = cursor.index;

  // Meta + Z = Undo Patterns
  useHotkeys("meta+z", canUndo ? undo : undefined, [canUndo]);

  // Meta + Shift + Z = Redo Patterns
  useHotkeys("meta+shift+z", canRedo ? redo : undefined, [canRedo]);

  // N = Note Click
  useHotkeys("n", props.onBlockClick, [props.onBlockClick]);

  // 0 = Rest Click
  useHotkeys("0", props.onRestClick, [props.onRestClick]);

  // 1 = Select 64th Note
  useHotkeys("1", () => dispatch(setEditorNoteDuration("64th")));

  // 2 = Select 32nd Note
  useHotkeys("2", () => dispatch(setEditorNoteDuration("32nd")));

  // 3 = Select 16th Note
  useHotkeys("3", () => dispatch(setEditorNoteDuration("16th")));

  // 4 = Select Eighth Note
  useHotkeys("4", () => dispatch(setEditorNoteDuration("eighth")));

  // 5 = Select Quarter Note
  useHotkeys("5", () => dispatch(setEditorNoteDuration("quarter")));

  // 6 = Select Half Note
  useHotkeys("6", () => dispatch(setEditorNoteDuration("half")));

  // 7 = Select Whole Note
  useHotkeys("7", () => dispatch(setEditorNoteDuration("whole")));

  // A = Start/Stop Adding Notes
  useHotkeys("a", () => dispatch(toggleEditorAction("addingNotes")), []);

  // Backspace = Remove Note if Showing Cursor
  useHotkeys("backspace", props.onEraseClick, [props.onEraseClick]);

  // Shift + Backspace = Clear Pattern
  useHotkeys("shift+backspace", () => id && dispatch(_.clearPattern(id)), [id]);

  // . = Toggle Dotted Note
  useHotkeys(".", () => dispatch(toggleEditorDottedDuration()), []);

  // t = Toggle Triplet Note
  useHotkeys("t", () => dispatch(toggleEditorTripletDuration()), []);

  // Meta + D = Duplicate Pattern
  useHotkeys(
    "meta+d",
    () =>
      pattern &&
      dispatch(_.createPattern({ ...pattern, name: `${pattern?.name} Copy` })),
    [pattern]
  );

  // C = Toggle Cursor
  useHotkeys("c", pattern?.stream?.length ? cursor.toggle : () => null, [
    pattern,
    cursor.toggle,
  ]);

  // X = Toggle Anchor
  useHotkeys(
    "x",
    () => !cursor.hidden && dispatch(toggleEditorAction("insertingNotes")),
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
        dispatch(_.transposePattern({ id, transpose: 1 }));
      } else {
        dispatch(_.transposePatternBlock({ id, index, transpose: 1 }));
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
        dispatch(_.transposePattern({ id, transpose: 12 }));
      } else {
        dispatch(_.transposePatternBlock({ id, index, transpose: 12 }));
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
        dispatch(_.transposePattern({ id, transpose: -1 }));
      } else {
        dispatch(_.transposePatternBlock({ id, index, transpose: -1 }));
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
        dispatch(_.transposePattern({ id, transpose: -12 }));
      } else {
        dispatch(_.transposePatternBlock({ id, index, transpose: -12 }));
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
    () =>
      !isProdigy && pattern && dispatch(_.exportPatternToXML(pattern, true)),
    [isProdigy, pattern]
  );

  // M = Export Pattern to MIDI
  useHotkeys(
    "shift+m",
    () => !isProdigy && id && dispatch(_.exportPatternToMIDI(id)),
    [isProdigy, id]
  );

  // R = Prompt for repeat
  useHotkeys(
    "r",
    promptUserForNumber(
      "Repeat Your Pattern",
      "How many times would you like to repeat your pattern?",
      (n) => {
        if (id) dispatch(_.repeatPattern({ id, repeat: n }));
      }
    ),
    [id]
  );

  // , = Continue Pattern
  useHotkeys(
    "comma",
    promptUserForNumber(
      "Continue Your Pattern",
      "How many notes would you like to continue your pattern for?",
      (n) => {
        if (id) dispatch(_.continuePattern({ id, length: n }));
      }
    ),
    [id]
  );

  // Meta + "-" = Diminish Pattern
  useHotkeys(
    "meta+minus",
    () => id && dispatch(_.stretchPattern({ id, factor: 0.5 })),
    { preventDefault: true },
    [id]
  );

  // Meta + "=" = Augment Pattern
  useOverridingHotkeys(
    "meta+equal",
    () => id && dispatch(_.stretchPattern({ id, factor: 2 })),
    { preventDefault: true },
    [id]
  );

  // Shift + Space = Play Pattern
  useHotkeys("shift+space", () => pattern && dispatch(_.playPattern(pattern)), [
    pattern,
  ]);
}
