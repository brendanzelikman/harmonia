import { Hotkey, useHotkeysInEditor } from "lib/react-hotkeys-hook";
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
import {
  addPoseBlock,
  removePoseBlock,
  clearPose,
  updatePoseBlock,
} from "types/Pose/PoseSlice";
import { useProjectDispatch } from "types/hooks";
import { repeatPoseStream } from "types/Pose/PoseThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { Pose, PoseId } from "types/Pose/PoseTypes";

export function usePoseEditorHotkeys(props: PoseEditorProps) {
  const dispatch = useProjectDispatch();
  const { pose, editState, selectPrevModule, selectNextModule, toggleEditing } =
    props;
  const id = pose?.id;
  const size = pose?.stream?.length ?? 0;
  const index = editState?.index;

  useHotkeysInEditor(dispatch(ADD_POSE_VECTOR_HOTKEY(id)));
  useHotkeysInEditor(
    dispatch(REMOVE_POSE_VECTOR_HOTKEY(id, index ?? size - 1))
  );
  useHotkeysInEditor(dispatch(CLEAR_POSE_STREAM_HOTKEY(id)));
  useHotkeysInEditor(dispatch(REPEAT_POSE_STREAM_HOTKEY(id)));

  useHotkeysInEditor(
    dispatch(SELECT_PREV_POSE_VECTOR_HOTKEY(selectPrevModule))
  );
  useHotkeysInEditor(
    dispatch(SELECT_NEXT_POSE_VECTOR_HOTKEY(selectNextModule))
  );
  useHotkeysInEditor(
    dispatch(EDIT_POSE_VECTOR_HOTKEY(() => toggleEditing(editState)))
  );

  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "1", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "2", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "3", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "4", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "5", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "6", index)));
  useHotkeysInEditor(dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY(pose, "7", index)));
}

export const ADD_POSE_VECTOR_HOTKEY =
  (id?: PoseId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Infinite Vector",
    description: "Add a new vector to the pose.",
    shortcut: "a",
    callback: () => id && dispatch(addPoseBlock({ id, block: { vector: {} } })),
  });

export const REMOVE_POSE_VECTOR_HOTKEY =
  (id?: PoseId, index?: number): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Delete Last/Selected Vector",
    description: "Remove the selected vector from the pose.",
    shortcut: "backspace",
    callback: () =>
      id && index !== undefined && dispatch(removePoseBlock({ id, index })),
  });

export const CLEAR_POSE_STREAM_HOTKEY =
  (id?: PoseId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Clear Stream",
    description: "Remove all vectors from the pose.",
    shortcut: "shift+backspace",
    callback: () => id && dispatch(clearPose(id)),
  });

export const REPEAT_POSE_STREAM_HOTKEY =
  (id?: PoseId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Repeat Stream",
    description: "Repeat the current stream.",
    shortcut: "shift+r",
    callback: promptUserForNumber(
      "Repeat Your Stream",
      "How many times would you like to repeat this stream?",
      (value) => id && dispatch(repeatPoseStream(id, value))
    ),
  });

export const ADD_POSE_FINITE_VECTOR_HOTKEY =
  (pose?: Pose, shortcut?: string, index?: number): Thunk<Hotkey> =>
  (dispatch) => {
    const duration =
      shortcut === "1"
        ? WholeNoteTicks
        : shortcut === "2"
        ? HalfNoteTicks
        : shortcut === "3"
        ? QuarterNoteTicks
        : shortcut === "4"
        ? EighthNoteTicks
        : shortcut === "5"
        ? SixteenthNoteTicks
        : shortcut === "6"
        ? ThirtySecondNoteTicks
        : shortcut === "7"
        ? SixtyFourthNoteTicks
        : "1 to 7";
    const noData = duration === "1 to 7";
    return {
      name: "Add Finite Vector",
      description: `Add a new vector to the pose with a specific duration.`,
      shortcut: shortcut ?? "7",
      callback: () => {
        if (!pose?.id || noData) return;
        const { id } = pose;
        if (index === undefined) {
          dispatch(addPoseBlock({ id, block: { vector: {}, duration } }));
        } else {
          const block = pose.stream[index];
          dispatch(
            updatePoseBlock({ id, index, block: { ...block, duration } })
          );
        }
      },
    };
  };

export const SELECT_PREV_POSE_VECTOR_HOTKEY =
  (callback: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Select Previous Module",
    description: "Select the previous module in the pose.",
    shortcut: "w",
    callback,
  });

export const SELECT_NEXT_POSE_VECTOR_HOTKEY =
  (callback: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Select Next Module",
    description: "Select the next module in the pose.",
    shortcut: "s",
    callback,
  });

export const EDIT_POSE_VECTOR_HOTKEY =
  (callback: () => void): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Toggle Editing",
    description: "Start or stop editing a vector.",
    shortcut: "c",
    callback,
  });

export const POSE_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(ADD_POSE_VECTOR_HOTKEY()),
  dispatch(REMOVE_POSE_VECTOR_HOTKEY()),
  dispatch(CLEAR_POSE_STREAM_HOTKEY()),
  dispatch(REPEAT_POSE_STREAM_HOTKEY()),
  dispatch(ADD_POSE_FINITE_VECTOR_HOTKEY()),
];
