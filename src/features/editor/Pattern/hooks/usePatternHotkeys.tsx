import { PatternEditorCursorProps } from "..";
import { Duration } from "types/units";
import { useHotkeys } from "react-hotkeys-hook";
import { createPromptedAction } from "redux/util";

interface PatternShortcutProps extends PatternEditorCursorProps {
  onDurationClick: (duration: Duration) => void;
}

export default function usePatternHotkeys(props: PatternShortcutProps) {
  const { pattern, cursor } = props;
  const rewindCursor = () => cursor.setIndex(0);
  const forwardCursor = () =>
    cursor.setIndex((pattern?.stream.length ?? 1) - 1);

  // 1 = Select 64th Note
  useHotkeys("1", () => props.onDurationClick("64th"));

  // 2 = Select 32nd Note
  useHotkeys("2", () => props.onDurationClick("32nd"));

  // 3 = Select 16th Note
  useHotkeys("3", () => props.onDurationClick("16th"));

  // 4 = Select Eighth Note
  useHotkeys("4", () => props.onDurationClick("eighth"));

  // 5 = Select Quarter Note
  useHotkeys("5", () => props.onDurationClick("quarter"));

  // 6 = Select Half Note
  useHotkeys("6", () => props.onDurationClick("half"));

  // 7 = Select Whole Note
  useHotkeys("7", () => props.onDurationClick("whole"));

  // A = Start/Stop Adding Notes
  useHotkeys("a", () => props.toggleState("adding"), []);

  // Backspace = Remove Note if Showing Cursor
  useHotkeys(
    "backspace",
    () => {
      if (!pattern || cursor.hidden) return;
      const onLast = cursor.index === pattern.stream.length - 1;
      props.removePatternNote(cursor.index);
      if (onLast) cursor.prev();
    },
    [pattern, cursor]
  );

  // Shift + Backspace = Clear Pattern
  useHotkeys("shift+backspace", props.clearPattern, []);

  // 0 = Input Rest
  useHotkeys("0", () => props.onRestClick(cursor), [cursor, pattern]);

  // . = Toggle Dotted Note
  useHotkeys(
    ".",
    () =>
      props.setNoteTiming(
        props.noteTiming === "dotted" ? "straight" : "dotted"
      ),
    [props.noteTiming]
  );

  // t = Toggle Triplet Note
  useHotkeys(
    "t",
    () =>
      props.setNoteTiming(
        props.noteTiming === "triplet" ? "straight" : "triplet"
      ),
    [props.noteTiming]
  );

  // Meta + D = Duplicate Pattern
  useHotkeys(
    "meta+d",
    () => props.copyPattern(pattern),
    { preventDefault: true },
    [pattern]
  );

  // C = Toggle Cursor
  useHotkeys("c", cursor.toggle);

  // X = Toggle Anchor
  useHotkeys("x", () => !cursor.hidden && props.toggleState("inserting"));

  // Left Arrow = Rotate Pattern or Move Cursor Left
  useHotkeys(
    "left",
    () => (cursor.hidden ? props.rotatePattern(-1) : cursor.prev()),
    [cursor]
  );

  // Right Arrow = Rotate Pattern or Move Cursor Right
  useHotkeys(
    "right",
    () => (cursor.hidden ? props.rotatePattern(1) : cursor.next()),
    [cursor]
  );

  // Shift + Left Arrow = Skip Cursor Left
  useHotkeys("shift+left", rewindCursor, [cursor]);

  // Shift + Right Arrow = Skip Cursor Right
  useHotkeys("shift+right", forwardCursor, [cursor]);

  // Up Arrow = Transpose Up 1 Step
  useHotkeys(
    "up",
    () =>
      cursor.hidden
        ? props.transposePattern(1)
        : props.transposePatternNote(cursor.index, 1),
    [cursor]
  );

  // Shift + Up Arrow = Transpose Up 1 Octave
  useHotkeys(
    "shift+up",
    () =>
      cursor.hidden
        ? props.transposePattern(12)
        : props.transposePatternNote(cursor.index, 12),
    [cursor]
  );

  // Down Arrow = Transpose Down 1 Step
  useHotkeys(
    "down",
    () =>
      cursor.hidden
        ? props.transposePattern(-1)
        : props.transposePatternNote(cursor.index, -1),
    [cursor]
  );

  // Shift + Down Arrow = Transpose Down 1 Octave
  useHotkeys(
    "shift+down",
    () =>
      cursor.hidden
        ? props.transposePattern(-12)
        : props.transposePatternNote(cursor.index, -12),
    [cursor]
  );

  // X = Export Pattern to XML
  useHotkeys("shift+x", () => props.exportPatternToXML(pattern), [pattern]);

  // M = Export Pattern to MIDI
  useHotkeys("shift+m", () => props.exportPatternToMIDI(pattern), [pattern]);

  // r = Prompt for repeat
  useHotkeys(
    "r",
    createPromptedAction("Repeat pattern N times", props.repeatPattern)
  );

  // , = Continue Pattern
  useHotkeys(
    ",",
    createPromptedAction("Continue pattern for N notes", props.continuePattern),
    { splitKey: "," }
  );

  // Meta + "-" = Diminish Pattern
  useHotkeys("meta+-", props.diminishPattern);

  // Meta + "+" = Augment Pattern
  useHotkeys("meta_+", props.augmentPattern, { combinationKey: "_" });

  // Shift + Space = Play Pattern
  useHotkeys("shift+space", () => props.playPattern(pattern), [pattern]);
}
