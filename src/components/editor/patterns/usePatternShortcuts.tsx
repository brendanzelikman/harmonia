import { useState } from "react";
import useEventListeners from "hooks/useEventListeners";
import { isInputEvent } from "appUtil";
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
  // Detect shift key
  const [holdingShift, setHoldingShift] = useState(false);
  const [holdingAlt, setHoldingAlt] = useState(false);

  const rewindCursor = () => props.cursor.setIndex(0);
  const forwardCursor = () =>
    props.cursor.setIndex((props.pattern?.stream.length ?? 1) - 1);

  useEventListeners(
    {
      // "Cmd + Z" = Undo
      // "Cmd + Shift + Z" = Redo
      z: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          const holdingShift = !!(e as KeyboardEvent).shiftKey;
          if (holdingShift) {
            props.redoPatterns();
          } else {
            props.undoPatterns();
          }
        },
      },
      // Space = Play Pattern
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          if (props.pattern) props.playPattern(props.pattern.id);
        },
      },
      // X = Export Pattern to XML
      X: {
        keydown: (e) => {
          if (isInputEvent(e) || !(e as KeyboardEvent).shiftKey) return;
          e.preventDefault();
          if (props.pattern) props.exportPatternToXML(props.pattern);
        },
      },
      // X = Export Pattern to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !(e as KeyboardEvent).shiftKey) return;
          e.preventDefault();
          if (props.pattern) props.exportPatternToMIDI(props.pattern);
        },
      },
      // + = Start/Stop Adding Notes
      "+": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.onState("adding")) {
            props.clearState();
          } else {
            props.setState("adding");
          }
        },
      },
      // I = Start/Stop Inserting Notes
      i: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.onState("inserting")) {
            props.clearState();
          } else {
            props.setState("inserting");
          }
        },
      },
      // - = Remove Note
      "-": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!props.pattern || props.cursor.hidden) return;
          props.removePatternNote(props.pattern.id, props.cursor.index);
        },
      },
      // Delete = Clear Pattern
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.clearPattern(props.pattern);
        },
      },
      // ` = Show/Hide Cursor
      "`": {
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
          if ((e as KeyboardEvent).shiftKey) {
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
          if ((e as KeyboardEvent).shiftKey) {
            forwardCursor();
          } else {
            props.cursor.next();
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
          props.setDuration("16th");
        },
      },
      // 2 = Select Eighth Note
      2: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("eighth");
        },
      },
      // 3 = Select Quarter Note
      3: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("quarter");
        },
      },
      // 4 = Select Half Note
      4: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("half");
        },
      },
      // 5 = Select Whole Note
      5: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          props.setDuration("whole");
        },
      },
      // [ = Transpose Pattern Down
      "[": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.transposePattern(props.pattern, -1);
        },
      },
      // ] = Transpose Pattern Up
      "]": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.transposePattern(props.pattern, 1);
        },
      },
      // { = Invert Pattern Down
      "{": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.rotatePattern(props.pattern, -1);
        },
      },
      // } = Invert Pattern Up
      "}": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.rotatePattern(props.pattern, 1);
        },
      },
      // , = Shrink Pattern
      ",": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.shrinkPattern(props.pattern);
        },
      },
      // . = Stretch Pattern
      ".": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.stretchPattern(props.pattern);
        },
      },
      // < = Halve Pattern
      "<": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.halvePattern(props.pattern);
        },
      },
      // > = Double Pattern
      ">": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.repeatPattern(props.pattern, 2);
        },
      },
      // ? = Shuffle Pattern
      "?": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.shufflePattern(props.pattern);
        },
      },
      // * = Randomize Pattern
      "*": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.pattern) props.randomizePattern(props.pattern, 8);
        },
      },
    },
    [props, setHoldingShift, setHoldingAlt]
  );

  return { holdingShift, holdingAlt };
}
