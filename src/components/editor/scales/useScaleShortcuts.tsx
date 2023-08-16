import { isInputEvent } from "appUtil";
import useEventListeners from "hooks/useEventListeners";
import { ScaleEditorProps } from ".";
import { Scale } from "types/scales";

interface ScaleShortcutProps extends ScaleEditorProps {
  scale: Scale;
  onState: (state: any) => boolean;
  setState: (state: any) => void;
  clearState: () => void;
}

export default function useScaleShortcuts(props: ScaleShortcutProps) {
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
            props.redoScales();
          } else {
            props.undoScales();
          }
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
      // - = Start/Stop Removing Notes
      "-": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.onState("removing")) {
            props.clearState();
          } else {
            props.setState("removing");
          }
        },
      },
      // Delete = Clear Scale
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.scale) props.clearScale(props.scale.id);
        },
      },
      // [ = Transpose Scale Down
      "[": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.scale) props.transposeScale(props.scale.id, -1);
        },
      },
      // ] = Transpose Scale Up
      "]": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.scale) props.transposeScale(props.scale.id, 1);
        },
      },
      // { = Invert Scale Down
      "{": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.scale) props.rotateScale(props.scale.id, -1);
        },
      },
      // } = Invert Scale Up
      "}": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.scale) props.rotateScale(props.scale.id, 1);
        },
      },
    },
    [props.scale, props.onState, props.setState, props.clearState]
  );
}
