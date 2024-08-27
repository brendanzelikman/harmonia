import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { PoseEditorProps } from "../PoseEditor";
import { promptUserForNumber } from "utils/html";
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
import { addPoseBlock, removePoseBlock, clearPose } from "types/Pose/PoseSlice";
import { useProjectDispatch } from "types/hooks";
import { repeatPoseStream } from "types/Pose/PoseThunks";

const useHotkeys = useScopedHotkeys("editor");

export function usePoseEditorHotkeys(props: PoseEditorProps) {
  const dispatch = useProjectDispatch();
  const { pose, editState } = props;
  const id = pose?.id;

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

  // W = Select Previous Module
  useHotkeys("w", props.selectPrevModule);

  // S = Select Next Module
  useHotkeys("s", props.selectNextModule);

  useHotkeys("1", () => addVector(WholeNoteTicks), [addVector]);
  useHotkeys("2", () => addVector(HalfNoteTicks), [addVector]);
  useHotkeys("3", () => addVector(QuarterNoteTicks), [addVector]);
  useHotkeys("4", () => addVector(EighthNoteTicks), [addVector]);
  useHotkeys("5", () => addVector(SixteenthNoteTicks), [addVector]);
  useHotkeys("6", () => addVector(ThirtySecondNoteTicks), [addVector]);
  useHotkeys("7", () => addVector(SixtyFourthNoteTicks), [addVector]);

  // R = Repeat Stream
  useHotkeys(
    "shift+r",
    promptUserForNumber(
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
