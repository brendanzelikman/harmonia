import { useState } from "react";
import useEventListeners from "hooks/useEventListeners";
import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "appUtil";
import { PatternEditorProps } from ".";

interface PatternShortcutProps extends PatternEditorProps {
  onState: (state: any) => boolean;
  setState: (state: any) => void;
  clearState: () => void;
  cursor: any;
  onRestClick: () => void;
  setDuration: (duration: any) => void;
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
      // Space = Play Pattern
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          // if (props.pattern) props.playPattern(props.pattern.id);
        },
      },
      // X = Export Pattern to XML
      X: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          e.preventDefault();
          if (props.pattern) props.exportPatternToXML(props.pattern);
        },
      },
      // M = Export Pattern to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          e.preventDefault();
          if (props.pattern) props.exportPatternToMIDI(props.pattern);
        },
      },
      // A = Start/Stop Adding Notes
      a: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.onState("adding") || props.onState("inserting")) {
            props.clearState();
          } else {
            props.setState("adding");
          }
        },
      },
      // X = Start/Stop Anchoring Notes
      x: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.cursor.hidden) return;
          if (props.onState("inserting")) {
            props.setState("adding");
          } else {
            props.setState("inserting");
          }
        },
      },
      // Delete = Remove Note
      // Shift + Delete = Clear Pattern
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!props.pattern) return;
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

      // C = Show/Hide Cursor
      c: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern)
            props.cursor.hidden ? props.cursor.show() : props.cursor.hide();
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
      // Up Arrow = Transpose Up Pattern or Note
      ArrowUp: {
        keydown: (e) => {
          if (!props.pattern) return;
          cancelEvent(e);
          if (props.cursor.hidden) {
            props.transposePattern(props.pattern, 1);
          } else {
            props.transposePatternNote(props.pattern, props.cursor.index, 1);
          }
        },
      },
      // Down Arrow = Transpose Note Down
      ArrowDown: {
        keydown: (e) => {
          if (!props.pattern) return;
          cancelEvent(e);
          if (props.cursor.hidden) {
            props.transposePattern(props.pattern, -1);
          } else {
            props.transposePatternNote(props.pattern, props.cursor.index, -1);
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
      // 0 = Add/Insert Rest
      0: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.onRestClick();
        },
      },
      // 1 = Select 16th Note
      1: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("64th");
        },
      },
      // 2 = Select Eighth Note
      2: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("32nd");
        },
      },
      // 3 = Select 16th Note
      3: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("16th");
        },
      },
      // 4 = Select Eighth Note
      4: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("eighth");
        },
      },
      // 5 = Select Quarter Note
      5: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("quarter");
        },
      },
      // 6 = Select Half Note
      6: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("half");
        },
      },
      // 7 = Select Whole Note
      7: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("whole");
        },
      },
      // "T" = Prompt for Scalar Transposition
      T: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          const input = prompt("Transpose pattern by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.transposePattern(props.pattern, sanitizedInput);
        },
      },
      // "t" = Prompt for Chordal Transposition
      t: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          const input = prompt("Transpose pattern along N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.rotatePattern(props.pattern, sanitizedInput);
        },
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
      // [ = Transpose Pattern Down
      "[": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.transposePattern(props.pattern, -1);
        },
      },
      // ] = Transpose Pattern Up
      "]": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.transposePattern(props.pattern, 1);
        },
      },
      // { = Invert Pattern Down
      "{": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.rotatePattern(props.pattern, -1);
        },
      },
      // } = Invert Pattern Up
      "}": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.rotatePattern(props.pattern, 1);
        },
      },
      // , = Shrink Pattern
      ",": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.diminishPattern(props.pattern);
        },
      },
      // . = Stretch Pattern
      ".": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.augmentPattern(props.pattern);
        },
      },
      // < = Halve Pattern
      "<": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.halvePattern(props.pattern);
        },
      },
      // > = Double Pattern
      ">": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.repeatPattern(props.pattern, 2);
        },
      },
      // * = Randomize Pattern
      "*": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.pattern) return;
          props.randomizePattern(props.pattern, 8);
        },
      },
    },
    [props, setHoldingShift, setHoldingAlt]
  );

  return { holdingShift, holdingAlt };
}
