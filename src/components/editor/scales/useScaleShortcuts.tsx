import { cancelEvent, isHoldingShift, isInputEvent } from "appUtil";
import useEventListeners from "hooks/useEventListeners";
import { ScaleEditorProps } from ".";
import { Scale } from "types/scales";

interface ScaleShortcutProps extends ScaleEditorProps {
  scale: Scale;
}

export default function useScaleShortcuts(props: ScaleShortcutProps) {
  useEventListeners(
    {
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
      // Shift + Delete = Clear Scale
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;

          // Clear Scale
          if (isHoldingShift(e)) {
            if (props.scale) props.clearScale(props.scale.id);
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
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          props.transposeScale(props.scale.id, 1);
        },
      },
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          props.transposeScale(props.scale.id, -1);
        },
      },
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          props.rotateScale(props.scale.id, -1);
        },
      },
      ArrowRight: {
        keydown: (e) => {
          if (isInputEvent(e) || !props.scale) return;
          cancelEvent(e);
          props.rotateScale(props.scale.id, 1);
        },
      },
    },
    [props.scale, props.adding, props.removing]
  );
}
