import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { PoseEditorProps } from "../PoseEditor";
import {
  addPoseBlock,
  clearPose,
  removePoseBlock,
  repeatPoseStream,
} from "redux/Pose";
import { promptUser } from "utils/html";
import {
  EighthNoteTicks,
  HalfNoteTicks,
  QuarterNoteTicks,
  SixteenthNoteTicks,
  SixtyFourthNoteTicks,
  ThirtySecondNoteTicks,
  WholeNoteTicks,
} from "utils/durations";
import { Tick } from "types/units";
import { useCallback } from "react";

const useHotkeys = useScopedHotkeys("editor");

export function usePoseEditorHotkeys(props: PoseEditorProps) {
  const { dispatch, pose, editState, undo, redo } = props;
  const { canUndo, canRedo } = props;
  const id = pose?.id;

  // Meta + Z = Undo Poses
  useHotkeys("meta+z", canUndo ? undo : undefined, [canUndo]);

  // Meta + Shift + Z = Redo Poses
  useHotkeys("meta+shift+z", canRedo ? redo : undefined, [canRedo]);

  // V = Add Vector
  useHotkeys(
    "a",
    () => id && dispatch(addPoseBlock({ id, block: { vector: {} } })),
    [id]
  );

  // 1-7 = Add Vectors with Durations
  const addVector = useCallback(
    (duration: Tick) => {
      if (!id) return;
      const block = { vector: {}, duration, index: pose.stream.length - 1 };
      dispatch(addPoseBlock({ id, block }));
    },
    [id, pose]
  );
  useHotkeys("1", () => addVector(WholeNoteTicks), [addVector]);
  useHotkeys("2", () => addVector(HalfNoteTicks), [addVector]);
  useHotkeys("3", () => addVector(QuarterNoteTicks), [addVector]);
  useHotkeys("4", () => addVector(EighthNoteTicks), [addVector]);
  useHotkeys("5", () => addVector(SixteenthNoteTicks), [addVector]);
  useHotkeys("6", () => addVector(ThirtySecondNoteTicks), [addVector]);
  useHotkeys("7", () => addVector(SixtyFourthNoteTicks), [addVector]);

  // R = Repeat Stream
  useHotkeys(
    "r",
    promptUser(
      "Repeat Your Stream",
      "How many times would you like to repeat this stream?",
      (value) => id && dispatch(repeatPoseStream(id, value))
    ),
    [id]
  );

  // Delete = Remove Selected or Last Vector
  useHotkeys(
    "backspace",
    () => {
      if (!pose?.stream.length) return;
      const index = editState?.index ?? pose.stream.length - 1;
      dispatch(removePoseBlock({ id: pose.id, index }));
    },
    [pose, editState]
  );

  // Shift + Delete = Clear Stream
  useHotkeys("shift+backspace", () => id && dispatch(clearPose(id)), [id]);
}
