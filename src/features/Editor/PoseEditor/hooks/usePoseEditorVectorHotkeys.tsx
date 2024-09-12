import { Hotkey, useHotkeysInEditor } from "lib/react-hotkeys-hook";
import { PoseEditorVectorProps } from "../components/PoseEditorVector";
import { useProjectDispatch } from "types/hooks";
import { updatePoseBlock } from "types/Pose/PoseSlice";
import { PoseVectorId } from "types/Pose/PoseTypes";
import { next, prev } from "utils/array";
import { noop } from "lodash";
import { Thunk } from "types/Project/ProjectTypes";

interface PoseEditorVectorHotkeyProps extends PoseEditorVectorProps {
  vectorId: PoseVectorId;
  setVectorId: (id: PoseVectorId) => void;
}

export function usePoseEditorVectorHotkeys(props: PoseEditorVectorHotkeyProps) {
  const dispatch = useProjectDispatch();
  const {
    editState,
    toggleEditing,
    pose,
    vectors,
    index,
    vectorKeys,
    vectorId,
    setVectorId,
    module,
  } = props;
  const id = pose?.id;
  const vectorIndex = vectorKeys.indexOf(vectorId);
  const vector = vectors[index].vector;

  // Shift = Switch between edit state
  useHotkeysInEditor(
    dispatch(
      TOGGLE_POSE_EDIT_HOTKEY(() => {
        if (!id || !editState || index !== editState.index) return;
        const type = editState.type === "duration" ? "offsets" : "duration";
        toggleEditing({ ...editState, type });
      })
    )
  );

  // Up = Increase offset of vector
  useHotkeysInEditor(
    dispatch(
      INCREASE_POSE_VECTOR_OFFSET_HOTKEY(() => {
        if (!id || !editState || index !== editState.index) return;
        const value = vector[vectorId] ?? 0;
        const block = {
          ...module,
          vector: { ...vector, [vectorId]: value + 1 },
        };
        dispatch(updatePoseBlock({ id, index, block }));
      })
    )
  );

  // Down = Decrease offset of vector
  useHotkeysInEditor(
    dispatch(
      DECREASE_POSE_VECTOR_OFFSET_HOTKEY(() => {
        if (!id || !editState || index !== editState.index) return;
        const value = vector[vectorId] ?? 0;
        const block = {
          ...module,
          vector: { ...vector, [vectorId]: value - 1 },
        };
        dispatch(updatePoseBlock({ id, index, block }));
      })
    )
  );

  // Left = Select previous offset
  useHotkeysInEditor(
    dispatch(
      SELECT_PREVIOUS_POSE_OFFSET_HOTKEY(() => {
        if (!editState || index !== editState.index) return;
        setVectorId(prev(vectorKeys, vectorIndex));
      })
    )
  );

  // Right = Select next offset
  useHotkeysInEditor(
    dispatch(
      SELECT_NEXT_POSE_OFFSET_HOTKEY(() => {
        if (!editState || index !== editState.index) return;
        setVectorId(next(vectorKeys, vectorIndex));
      })
    )
  );

  // 0 = Clear offset
  useHotkeysInEditor(
    dispatch(
      CLEAR_POSE_VECTOR_OFFSET_HOTKEY(() => {
        if (!id || !editState || index !== editState.index) return;
        const newVector = { ...vector, [vectorId]: 0 };
        const block = { ...module, vector: newVector };
        dispatch(updatePoseBlock({ id, index, block }));
      })
    )
  );
}

export const TOGGLE_POSE_EDIT_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Edit Pose Vector",
    description: "Start/stop editing the pose vector.",
    shortcut: "comma",
    callback,
  });

export const INCREASE_POSE_VECTOR_OFFSET_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Increase Pose Vector Offset",
    description: "Increase the offset of the pose vector.",
    shortcut: "up",
    callback,
  });

export const DECREASE_POSE_VECTOR_OFFSET_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Decrease Pose Vector Offset",
    description: "Decrease the offset of the pose vector.",
    shortcut: "down",
    callback,
  });

export const SELECT_PREVIOUS_POSE_OFFSET_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Select Previous Pose Offset",
    description: "Select the previous offset in the pose vector.",
    shortcut: "left",
    callback,
  });

export const SELECT_NEXT_POSE_OFFSET_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Select Next Pose Offset",
    description: "Select the next offset in the pose vector.",
    shortcut: "right",
    callback,
  });

export const CLEAR_POSE_VECTOR_OFFSET_HOTKEY =
  (callback: () => void = noop): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Clear Pose Vector Offset",
    description: "Clear the offset of the pose vector.",
    shortcut: "0",
    callback,
  });

export const POSE_VECTOR_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(TOGGLE_POSE_EDIT_HOTKEY()),
  dispatch(INCREASE_POSE_VECTOR_OFFSET_HOTKEY()),
  dispatch(DECREASE_POSE_VECTOR_OFFSET_HOTKEY()),
  dispatch(SELECT_PREVIOUS_POSE_OFFSET_HOTKEY()),
  dispatch(SELECT_NEXT_POSE_OFFSET_HOTKEY()),
  dispatch(CLEAR_POSE_VECTOR_OFFSET_HOTKEY()),
];
