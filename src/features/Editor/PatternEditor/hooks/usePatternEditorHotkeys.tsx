import { promptUser } from "utils/html";
import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { PatternEditorProps } from "../PatternEditor";
import {
  setEditorNoteDuration,
  toggleEditorAction,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
} from "redux/Editor";
import * as _ from "redux/Pattern";

const useHotkeys = useScopedHotkeys("editor");

export function usePatternEditorHotkeys(props: PatternEditorProps) {
  const { dispatch, undo, redo } = props;
  const { pattern, cursor, canUndo, canRedo } = props;
  const id = pattern?.id;
  const index = cursor.index;

  // Meta + Z = Undo Patterns
  useHotkeys("meta+z", canUndo ? undo : undefined, [canUndo]);

  // Meta + Shift + Z = Redo Patterns
  useHotkeys("meta+shift+z", canRedo ? redo : undefined, [canRedo]);

  // N = Block Click
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
    () => pattern && dispatch(_.exportPatternToXML(pattern, true)),
    [pattern]
  );

  // M = Export Pattern to MIDI
  useHotkeys("shift+m", () => id && dispatch(_.exportPatternToMIDI(id)), [id]);

  // r = Prompt for repeat
  useHotkeys(
    "r",
    promptUser("Repeat pattern N times", (n) => {
      if (id) dispatch(_.repeatPattern({ id, repeat: n }));
    })
  );

  // , = Continue Pattern
  useHotkeys(
    ",",
    promptUser("Continue pattern for N notes", (n) => {
      if (id) dispatch(_.continuePattern({ id, length: n }));
    }),
    { splitKey: "," },
    [id]
  );

  // Meta + "-" = Diminish Pattern
  useHotkeys(
    "meta+minus",
    () => id && dispatch(_.stretchPattern({ id, factor: 0.5 })),
    [id]
  );

  // Meta + "+" = Augment Pattern
  useHotkeys(
    "meta+plus",
    () => id && dispatch(_.stretchPattern({ id, factor: 2 })),
    [id]
  );

  // Shift + Space = Play Pattern
  useHotkeys("shift+space", () => pattern && dispatch(_.playPattern(pattern)), [
    pattern,
  ]);
}
