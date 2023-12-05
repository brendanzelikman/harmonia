import { Editor } from "features/Editor/components";
import { updatePose, updatePoseBlock } from "redux/Pose";
import { PoseEditorProps } from "../PoseEditor";
import { PoseEditorToolbar } from "./PoseEditorToolbar";
import {
  PoseVectorModule,
  getPoseCategory,
  isPoseVectorModule,
} from "types/Pose";
import { PoseEditorVector } from "./PoseEditorVector";
import { useProjectSelector } from "redux/hooks";
import { selectScaleTrackIds } from "redux/Track";
import { useCallback } from "react";

export function PoseEditorContent(props: PoseEditorProps) {
  const { dispatch, pose, isCustom } = props;
  const id = pose?.id;
  const category = getPoseCategory(pose);
  const stream = pose?.stream ?? [];
  const vectors = stream.filter(isPoseVectorModule);
  const trackIds = useProjectSelector(selectScaleTrackIds);
  const vectorKeys = ["chromatic", "chordal", ...trackIds];

  /** The pose editor displays the name of the pose as its title. */
  const PoseEditorTitle = (
    <Editor.Header
      editable={isCustom}
      title={pose?.name ?? "Pose"}
      setTitle={(name) => pose && dispatch(updatePose({ ...pose, name }))}
      subtitle={category}
      color={"bg-gradient-to-tr from-pink-500 to-pink-600"}
    />
  );

  // Create an update function for a vector module.
  const updateBlock = useCallback(
    (index: number) => (block: PoseVectorModule) => {
      if (!id) return;
      dispatch(updatePoseBlock({ id, index, block }));
    },
    [id]
  );

  // Display a vector module.
  const renderVectorModule = (module: PoseVectorModule, index: number) => {
    return (
      <div
        className="flex w-full items-center p-2 gap-4"
        key={`module-${index}`}
      >
        <strong>Vector {index + 1}:</strong>
        <PoseEditorVector
          {...props}
          vectors={vectors}
          vectorKeys={vectorKeys}
          module={module}
          index={index}
          updateBlock={updateBlock(index)}
        />
      </div>
    );
  };

  /** The pose editor displays its stream. */
  const PoseEditorStream = () => (
    <div className="flex w-full h-full overflow-auto p-2 items-center rounded mt-2">
      <div className="flex flex-col w-full h-full gap-4">
        {vectors.map(renderVectorModule)}
      </div>
    </div>
  );

  return (
    <Editor.Content>
      {PoseEditorTitle}
      <PoseEditorToolbar {...props} />
      {PoseEditorStream()}
    </Editor.Content>
  );
}
