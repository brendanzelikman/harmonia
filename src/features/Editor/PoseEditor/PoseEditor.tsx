import { useProjectSelector } from "redux/hooks";
import { EditorProps } from "..";
import { Editor } from "../components";
import { selectPoseFutureLength, selectPosePastLength } from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { PoseEditorContent, PoseEditorSidebar } from "./components";
import { PresetPoseMap } from "presets/poses";
import { getValueByKey } from "utils/objects";
import { usePoseEditorHotkeys } from "./hooks/usePoseEditorHotkeys";
import { isEqual } from "lodash";
import { useCallback, useState } from "react";

export type PoseEditType = "offsets" | "duration";
export type PoseEditState = { index: number; type: PoseEditType } | undefined;

export interface PoseEditorProps extends EditorProps {
  isCustom: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  editState: PoseEditState;
  toggleEditing: (state: PoseEditState) => void;
  onDuration: (index: number) => boolean;
  onOffsets: (index: number) => boolean;
  onModule: (index: number) => boolean;
}

function PoseEditorComponent(props: EditorProps) {
  const { dispatch, pose } = props;

  const id = pose?.id;
  const isCustom = !getValueByKey(PresetPoseMap, id);

  // Pose history undo/redo
  const canUndo = !!useProjectSelector(selectPosePastLength);
  const canRedo = !!useProjectSelector(selectPoseFutureLength);
  const undo = () => dispatch({ type: UndoTypes.undoPoses });
  const redo = () => dispatch({ type: UndoTypes.redoPoses });

  // Pose edit state for specific module
  const [editState, setEditState] = useState<PoseEditState>(undefined);

  // Check if the pose editor is editing a specific module
  const onState = useCallback(
    (state: PoseEditState) => isEqual(state, editState),
    [editState]
  );

  // Start editing a specific module
  const startEditing = useCallback(
    (state: PoseEditState) => setEditState(state),
    []
  );

  // Stop editing modules
  const stopEditing = useCallback(() => setEditState(undefined), []);

  // Toggle between a module and no module
  const toggleEditing = useCallback(
    (state: PoseEditState) => {
      if (onState(state)) {
        stopEditing();
      } else {
        startEditing(state);
      }
    },
    [onState]
  );

  // Check if the module's duration is being edited
  const onDuration = useCallback(
    (index: number) => onState({ index, type: "duration" }),
    [onState]
  );

  // Check if the module's offsets is being edited
  const onOffsets = useCallback(
    (index: number) => onState({ index, type: "offsets" }),
    [onState]
  );

  // Check if the vector module is being edited
  const onModule = useCallback(
    (index: number) => onDuration(index) || onOffsets(index),
    [onDuration, onOffsets]
  );

  const poseEditorProps: PoseEditorProps = {
    ...props,
    isCustom,
    canUndo,
    canRedo,
    undo,
    redo,
    editState,
    toggleEditing,
    onDuration,
    onOffsets,
    onModule,
  };
  usePoseEditorHotkeys(poseEditorProps);

  return (
    <Editor.Container id="pose-editor">
      <Editor.Body className="relative">
        <PoseEditorSidebar {...poseEditorProps} />
        <PoseEditorContent {...poseEditorProps} />
      </Editor.Body>
    </Editor.Container>
  );
}

export { PoseEditorComponent as PoseEditor };
