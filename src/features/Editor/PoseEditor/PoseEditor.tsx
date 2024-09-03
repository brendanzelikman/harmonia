import { PresetPoseMap } from "assets/poses";
import { getValueByKey } from "utils/objects";
import { usePoseEditorHotkeys } from "./hooks/usePoseEditorHotkeys";
import { isEqual } from "lodash";
import { useCallback, useState } from "react";
import { mod } from "utils/math";
import { EditorBody } from "../components/EditorBody";
import { EditorContainer } from "../components/EditorContainer";
import { PoseEditorContent } from "./components/PoseEditorContent";
import { PoseEditorSidebar } from "./components/PoseEditorSidebar";
import { EditorProps } from "../Editor";

export type PoseEditType = "offsets" | "duration";
export type PoseEditState = { index: number; type: PoseEditType } | undefined;

export interface PoseEditorProps extends EditorProps {
  isCustom: boolean;
  editState: PoseEditState;
  toggleEditing: (state: PoseEditState) => void;
  onDuration: (index: number) => boolean;
  onOffsets: (index: number) => boolean;
  onModule: (index: number) => boolean;
  selectNextModule: () => void;
  selectPrevModule: () => void;
}

function PoseEditorComponent(props: EditorProps) {
  const { pose } = props;

  const stream = pose?.stream;
  const streamLength = stream?.length;
  const id = pose?.id;
  const isCustom = !getValueByKey(PresetPoseMap, id);

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

  // Select the next module in the stream
  const selectNextModule = useCallback(() => {
    if (!streamLength) return;
    setEditState((state) =>
      state
        ? {
            ...state,
            index: mod(state.index + 1, streamLength),
          }
        : undefined
    );
  }, [streamLength]);

  // Select the previous module in the stream
  const selectPrevModule = useCallback(() => {
    if (!streamLength) return;
    setEditState((state) =>
      state
        ? {
            ...state,
            index: mod(state.index - 1, streamLength),
          }
        : undefined
    );
  }, [streamLength]);

  const poseEditorProps: PoseEditorProps = {
    ...props,
    isCustom,
    editState,
    toggleEditing,
    onDuration,
    onOffsets,
    onModule,
    selectNextModule,
    selectPrevModule,
  };
  usePoseEditorHotkeys(poseEditorProps);

  return (
    <EditorContainer id="pose-editor">
      <EditorBody className="relative">
        <PoseEditorSidebar {...poseEditorProps} />
        <PoseEditorContent {...poseEditorProps} />
      </EditorBody>
    </EditorContainer>
  );
}

export { PoseEditorComponent as PoseEditor };
