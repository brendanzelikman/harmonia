import { cancelEvent, isHoldingShift, isInputEvent } from "utils";
import useEventListeners from "hooks/useEventListeners";
import { ScaleEditorProps } from "..";
import { Scale } from "types/scale";
import { OSMDCursor } from "lib/opensheetmusicdisplay";

interface ScaleShortcutProps extends ScaleEditorProps {
  scale: Scale;
  cursor: OSMDCursor;
}

export default function useScaleShortcuts(props: ScaleShortcutProps) {
  const rewindCursor = () => props.cursor.setIndex(0);
  const forwardCursor = () =>
    props.cursor.setIndex((props.scale?.notes.length ?? 1) - 1);

  useEventListeners(
    {
      // Shift + Space = Play Scale
      " ": {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          if (!isHoldingShift(e)) return;
          cancelEvent(e);
          props.playScale(props.scale);
        },
      },
      // C = Toggle Cursor
      c: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          if (props.cursor.hidden) {
            props.cursor.show();
          } else {
            props.cursor.hide();
          }
        },
      },
      // A = Start/Stop Adding Notes
      a: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.adding) {
            props.clear();
          } else {
            props.setState("adding");
          }
        },
      },
      // Delete = Start/Stop Removing Notes
      // Cursor + Delete = Remove Note
      // Shift + Delete = Clear Scale
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;

          // Clear Scale
          if (isHoldingShift(e)) {
            if (props.scale) props.clearScale(props.scale.id);
            return;
          }

          // Delete Note
          if (!props.cursor.hidden) {
            props.removeNoteFromScale(
              props.scale.id,
              props.scale.notes[props.cursor.index]
            );
            return;
          }

          // Toggle Removing Notes
          if (props.removing) {
            props.clear();
          } else {
            props.setState("removing");
          }
        },
      },
      // "T" = Prompt for Scalar Transposition
      T: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          const input = prompt("Transpose scale by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.transposeScale(props.scale.id, sanitizedInput);
        },
      },
      // "t" = Prompt for Chordal Transposition
      t: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          const input = prompt("Transpose scale along N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (isNaN(sanitizedInput)) return;
          props.rotateScale(props.scale.id, sanitizedInput);
        },
      },
      // Up Arrow = Transpose Up 1 Semitone
      // Shift + Up Arrow = Transpose Up 12 Semitones
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          const holdingShift = isHoldingShift(e);
          const offset = holdingShift ? 12 : 1;
          props.transposeScale(props.scale.id, offset);
        },
      },
      // Down Arrow = Transpose Down 1 Semitone
      // Shift + Down Arrow = Transpose Down 12 Semitones
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          const holdingShift = isHoldingShift(e);
          const offset = holdingShift ? -12 : -1;
          props.transposeScale(props.scale.id, offset);
        },
      },
      // Left Arrow = Transpose Down 1 Chord Step
      // Cursor + Left Arrow = Rewind Cursor
      // Cursor + Shift + Left Arrow = Skip Cursor Left
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          const holdingShift = isHoldingShift(e);
          if (!props.cursor.hidden && props.cursor.index > 0) {
            if (holdingShift) {
              rewindCursor();
            } else {
              props.cursor.prev();
            }
          } else {
            props.rotateScale(props.scale.id, -1);
          }
        },
      },
      // Right Arrow = Transpose Up 1 Chord Step
      // Cursor + Right Arrow = Advance Cursor
      // Cursor + Shift + Right Arrow = Skip Cursor Right
      ArrowRight: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          if (
            !props.cursor.hidden &&
            props.cursor.index < props.scale.notes.length - 1
          ) {
            if (isHoldingShift(e)) {
              forwardCursor();
            } else {
              props.cursor.next();
            }
          } else {
            props.rotateScale(props.scale.id, 1);
          }
        },
      },
    },
    [props]
  );
}
