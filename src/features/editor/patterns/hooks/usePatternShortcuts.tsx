import { PatternEditorCursorProps } from "..";
import { Duration } from "types/units";
import { Pattern } from "types/Pattern";
import { useHotkeys } from "react-hotkeys-hook";

interface PatternShortcutProps extends PatternEditorCursorProps {
  transposedPattern?: Pattern;
  onDurationClick: (duration: Duration) => void;
}

export default function usePatternShortcuts(props: PatternShortcutProps) {
  const rewindCursor = () => props.cursor.setIndex(0);
  const forwardCursor = () =>
    props.cursor.setIndex((props.pattern?.stream.length ?? 1) - 1);

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
  useHotkeys(
    "a",
    () =>
      props.adding || props.inserting
        ? props.clear()
        : props.setState("adding"),
    [props.adding, props.inserting]
  );

  // Backspace = Remove Note if Showing Cursor
  useHotkeys(
    "backspace",
    () => {
      if (!props.pattern || props.cursor.hidden) return;
      const onLast = props.cursor.index === props.pattern.stream.length - 1;
      props.removePatternNote(props.pattern.id, props.cursor.index);
      if (onLast) props.cursor.prev();
    },
    [props.pattern, props.cursor]
  );

  // Shift + Backspace = Clear Pattern
  useHotkeys("shift+backspace", () => props.clearPattern(props.pattern), [
    props.pattern,
  ]);

  // 0 = Input Rest
  useHotkeys("0", () => props.onRestClick(props.pattern, props.cursor), [
    props.cursor,
    props.pattern,
  ]);

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
  useHotkeys("meta+d", () => props.copyPattern(props.pattern), [props.pattern]);

  // C = Toggle Cursor
  useHotkeys("c", props.cursor.toggle);

  // X = Toggle Anchor
  useHotkeys("x", () => !props.cursor.hidden && props.toggleState("inserting"));

  // Left Arrow = Rotate Pattern or Move Cursor Left
  useHotkeys(
    "left",
    () => {
      if (props.cursor.hidden) {
        props.rotatePattern(props.pattern, -1);
      } else {
        props.cursor.prev();
      }
    },
    [props.cursor, props.pattern]
  );

  // Shift + Left Arrow = Skip Cursor Left
  useHotkeys("shift+left", rewindCursor, [props.cursor]);

  // Right Arrow = Rotate Pattern or Move Cursor Right
  useHotkeys(
    "right",
    () => {
      if (props.cursor.hidden) {
        props.rotatePattern(props.pattern, 1);
      } else {
        props.cursor.next();
      }
    },
    [props.cursor, props.pattern]
  );

  // Shift + Right Arrow = Skip Cursor Right
  useHotkeys("shift+right", forwardCursor, [props.cursor]);

  // Up Arrow = Transpose Up 1 Step
  useHotkeys(
    "up",
    () => {
      if (props.cursor.hidden) {
        props.transposePattern(props.pattern, 1);
      } else {
        props.transposePatternNote(props.pattern, props.cursor.index, 1);
      }
    },
    [props.cursor, props.pattern]
  );

  // Shift + Up Arrow = Transpose Up 1 Octave
  useHotkeys(
    "shift+up",
    () => {
      if (props.cursor.hidden) {
        props.transposePattern(props.pattern, 12);
      } else {
        props.transposePatternNote(props.pattern, props.cursor.index, 12);
      }
    },
    [props.cursor, props.pattern]
  );

  // Down Arrow = Transpose Down 1 Step
  useHotkeys(
    "down",
    () => {
      if (props.cursor.hidden) {
        props.transposePattern(props.pattern, -1);
      } else {
        props.transposePatternNote(props.pattern, props.cursor.index, -1);
      }
    },
    [props.cursor, props.pattern]
  );

  // Shift + Down Arrow = Transpose Down 1 Octave
  useHotkeys(
    "shift+down",
    () => {
      if (props.cursor.hidden) {
        props.transposePattern(props.pattern, -12);
      } else {
        props.transposePatternNote(props.pattern, props.cursor.index, -12);
      }
    },
    [props.cursor, props.pattern]
  );

  // X = Export Pattern to XML
  useHotkeys("x", () => props.exportPatternToXML(props.pattern), [
    props.pattern,
  ]);

  // M = Export Pattern to MIDI
  useHotkeys("m", () => props.exportPatternToMIDI(props.pattern), [
    props.pattern,
  ]);

  // r = Prompt for repeat
  useHotkeys(
    "r",
    () => {
      if (!props.pattern) return;
      const input = prompt("Repeat pattern N times:");
      const sanitizedInput = parseInt(input ?? "");
      if (isNaN(sanitizedInput)) return;
      props.repeatPattern(props.pattern, sanitizedInput);
    },
    [props.pattern]
  );

  // , = Continue Pattern
  useHotkeys(
    ",",
    () => {
      if (!props.pattern) return;
      const input = prompt("Continue pattern for N notes:");
      const sanitizedInput = parseInt(input ?? "");
      if (isNaN(sanitizedInput)) return;
      props.continuePattern(props.pattern, sanitizedInput);
    },
    { splitKey: ";" },
    [props.pattern]
  );

  // Meta + "-" = Diminish Pattern
  useHotkeys("meta+-", () => props.diminishPattern(props.pattern), [
    props.pattern,
  ]);

  // Meta + "+" = Augment Pattern
  useHotkeys(
    "meta_+",
    () => props.augmentPattern(props.pattern),
    { combinationKey: "_" },
    [props.pattern]
  );

  // Shift + Space = Play Pattern
  useHotkeys(
    "shift+space",
    () => {
      if (props.selectedPatternId && props.transposedPattern) {
        props.playPattern(props.transposedPattern);
      }
    },
    [props]
  );
}
