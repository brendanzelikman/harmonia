import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { mod } from "utils/math";
import { PoseEditorVectorProps } from "../components/PoseEditorVector";
import { useProjectDispatch } from "types/hooks";
import { updatePoseBlock } from "types/Pose/PoseSlice";
import { PoseVectorId } from "types/Pose/PoseTypes";

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
  useOverridingHotkeys(
    "comma",
    () => {
      if (!id || !editState || index !== editState.index) return;
      const type = editState.type === "duration" ? "offsets" : "duration";
      toggleEditing({ ...editState, type });
    },
    [editState, id, index]
  );

  // Up = Increase offset of vector
  useOverridingHotkeys(
    "up",
    () => {
      if (!id || !editState || index !== editState.index) return;
      const value = vector[vectorId] ?? 0;
      const block = { ...module, vector: { ...vector, [vectorId]: value + 1 } };
      dispatch(updatePoseBlock({ id, index, block }));
    },
    [editState, vectorId, id, index, vector, module]
  );

  // Down = Decrease offset of vector
  useOverridingHotkeys(
    "down",
    () => {
      if (!id || !editState || index !== editState.index) return;
      const value = vector[vectorId] ?? 0;
      const block = { ...module, vector: { ...vector, [vectorId]: value - 1 } };
      dispatch(updatePoseBlock({ id, index, block }));
    },
    [editState, vectorId, id, index, vector, module]
  );

  // Left = Select previous offset
  useOverridingHotkeys(
    "left",
    () => {
      if (!editState || index !== editState.index) return;
      const prevIndex = mod(vectorIndex - 1, vectorKeys.length);
      const prevId = vectorKeys[prevIndex];
      setVectorId(prevId);
    },
    [editState, vectorIndex, vectorKeys]
  );

  // Right = Select next offset
  useOverridingHotkeys(
    "right",
    () => {
      if (!editState || index !== editState.index) return;
      const nextIndex = mod(vectorIndex + 1, vectorKeys.length);
      const nextId = vectorKeys[nextIndex];
      setVectorId(nextId);
    },
    [editState, vectorIndex, index, vectorKeys]
  );

  // 0 = Clear offset
  useOverridingHotkeys(
    "0",
    () => {
      if (!id || !editState || index !== editState.index) return;
      const newVector = { ...vector, [vectorId]: 0 };
      const block = { ...module, vector: newVector };
      dispatch(updatePoseBlock({ id, index, block }));
    },
    [editState, vectorId, id, index, vector, module]
  );
}
