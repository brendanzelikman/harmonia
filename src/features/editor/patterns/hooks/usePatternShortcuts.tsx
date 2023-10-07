import { useMemo, useState } from "react";
import useEventListeners from "hooks/useEventListeners";
import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "utils";
import { PatternEditorCursorProps } from "..";
import { Duration } from "types/units";
import { Pattern } from "types/Pattern";

interface PatternShortcutProps extends PatternEditorCursorProps {
  transposedPattern?: Pattern;
  onDurationClick: (duration: Duration) => void;
}

export default function usePatternShortcuts(props: PatternShortcutProps) {
  // Detect shift and alt key
  const [holdingShift, setHoldingShift] = useState(false);
  const [holdingAlt, setHoldingAlt] = useState(false);

  const rewindCursor = () => props.cursor.setIndex(0);
  const forwardCursor = () =>
    props.cursor.setIndex((props.pattern?.stream.length ?? 1) - 1);

  useEventListeners(
    {
      // 1 = Select 64th Note
      1: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("64th");
        },
      },
      // 2 = Select 32nd Note
      2: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("32nd");
        },
      },
      // 3 = Select 16th Note
      3: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("16th");
        },
      },
      // 4 = Select Eighth Note
      4: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("eighth");
        },
      },
      // 5 = Select Quarter Note
      5: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("quarter");
        },
      },
      // 6 = Select Half Note
      6: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("half");
        },
      },
      // 7 = Select Whole Note
      7: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e)) return;
          cancelEvent(e);
          props.onDurationClick("whole");
        },
      },

      // A = Start/Stop Adding Notes
      a: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.adding || props.inserting) {
            props.clear();
          } else {
            props.setState("adding");
          }
        },
      },

      // Delete = Remove Note
      // Shift + Delete = Clear Pattern
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!props.pattern) return;
          cancelEvent(e);
          if (isHoldingShift(e)) {
            props.clearPattern(props.pattern);
          } else {
            if (props.cursor.hidden) return;
            const onLast =
              props.cursor.index === props.pattern.stream.length - 1;
            props.removePatternNote(props.pattern.id, props.cursor.index);
            if (onLast) props.cursor.prev();
          }
        },
      },

      // 0 = Input Rest
      0: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          props.onRestClick(props.pattern, props.cursor);
        },
      },

      // . = Toggle Dotted Note
      ".": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          props.setNoteTiming(
            props.noteTiming === "dotted" ? "straight" : "dotted"
          );
        },
      },

      // t = Toggle Triplet Note
      t: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          props.setNoteTiming(
            props.noteTiming === "triplet" ? "straight" : "triplet"
          );
        },
      },

      // Cmd + N = Create New Pattern
      n: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          props.createPatterns();
        },
      },

      // Cmd + D = Duplicate Pattern
      d: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          props.copyPattern(props.pattern);
        },
      },

      // C = Show/Hide Cursor
      c: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern)
            props.cursor.hidden ? props.cursor.show() : props.cursor.hide();
        },
      },
      // x = Start/Stop Anchoring Note
      x: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          if (props.cursor.hidden) return;
          props.setState(props.inserting ? "adding" : "inserting");
        },
      },
      // Left Arrow = Move Cursor Left
      // Shift + Left Arrow = Skip Cursor Left
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);

          if (props.cursor.hidden) {
            props.rotatePattern(props.pattern, -1);
            return;
          }

          if (isHoldingShift(e)) {
            rewindCursor();
          } else {
            props.cursor.prev();
          }
        },
      },
      // Right Arrow = Move Cursor Right
      // Shift + Right Arrow = Skip Cursor Right
      ArrowRight: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);

          if (props.cursor.hidden) {
            props.rotatePattern(props.pattern, 1);
            return;
          }

          if (isHoldingShift(e)) {
            forwardCursor();
          } else {
            props.cursor.next();
          }
        },
      },

      // X = Export Pattern to XML
      X: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          if (props.pattern) props.exportPatternToXML(props.pattern);
        },
      },
      // M = Export Pattern to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          cancelEvent(e);
          if (props.pattern) props.exportPatternToMIDI(props.pattern);
        },
      },

      // Up Arrow = Transpose Up Pattern or Note
      ArrowUp: {
        keydown: (e) => {
          if (!props.pattern) return;
          cancelEvent(e);
          const holdingShift = isHoldingShift(e);
          const offset = holdingShift ? 12 : 1;
          if (props.cursor.hidden) {
            props.transposePattern(props.pattern, offset);
          } else {
            props.transposePatternNote(
              props.pattern,
              props.cursor.index,
              offset
            );
          }
        },
      },
      // Down Arrow = Transpose Note Down
      ArrowDown: {
        keydown: (e) => {
          if (!props.pattern) return;
          cancelEvent(e);
          const holdingShift = isHoldingShift(e);
          const offset = holdingShift ? -12 : -1;
          if (props.cursor.hidden) {
            props.transposePattern(props.pattern, offset);
          } else {
            props.transposePatternNote(
              props.pattern,
              props.cursor.index,
              offset
            );
          }
        },
      },
      Shift: {
        keydown: (e) => !isInputEvent(e) && setHoldingShift(true),
        keyup: (e) => !isInputEvent(e) && setHoldingShift(false),
      },
      Alt: {
        keydown: (e) => !isInputEvent(e) && setHoldingAlt(true),
        keyup: (e) => !isInputEvent(e) && setHoldingAlt(false),
      },
      // "r" = Prompt for repeat
      r: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          if (isHoldingCommand(e)) return;
          const input = prompt("Repeat pattern N times:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.repeatPattern(props.pattern, sanitizedInput);
        },
      },
      // "," = Continue Pattern
      ",": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          if (isHoldingCommand(e)) return;
          const input = prompt("Continue pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.continuePattern(props.pattern, sanitizedInput);
        },
      },

      // "Cmd + '-'" = Diminish Pattern
      "-": {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          props.diminishPattern(props.pattern);
        },
      },
      // "Cmd + '+'" = Augment Pattern
      "=": {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          props.augmentPattern(props.pattern);
        },
      },
      // Shift + Space = Play Pattern
      " ": {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          // Play Pattern Track
          if (props.selectedPatternId && props.transposedPattern) {
            props.playPattern(props.transposedPattern);
            return;
          }
        },
      },
    },
    [props]
  );

  return { holdingShift, holdingAlt };
}
