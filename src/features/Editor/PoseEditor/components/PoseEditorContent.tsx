import { PoseEditorProps } from "../PoseEditor";
import { PoseEditorToolbar } from "./PoseEditorToolbar";
import { PoseEditorVector } from "./PoseEditorVector";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { useCallback } from "react";
import { EditorContent } from "features/Editor/components/EditorContent";
import { EditorHeader } from "features/Editor/components/EditorHeader";
import { getPoseCategory, isPoseBucket } from "types/Pose/PoseFunctions";
import { updatePose, updatePoseBlock } from "types/Pose/PoseSlice";
import {
  isPoseOperation,
  PoseVectorId,
  PoseOperation,
} from "types/Pose/PoseTypes";
import { selectScaleTrackIds } from "types/Track/TrackSelectors";
import { ChromaticKey } from "assets/keys";

export function PoseEditorContent(props: PoseEditorProps) {
  const dispatch = useProjectDispatch();
  const { pose, isCustom } = props;
  const id = pose?.id;
  const category = getPoseCategory(pose);
  const stream = pose?.stream ?? [];
  const vectors = stream.filter(isPoseOperation);
  const trackIds = useProjectSelector(selectScaleTrackIds);
  const vectorKeys: PoseVectorId[] = [
    "chromatic",
    "chordal",
    "octave",
    ...ChromaticKey,
    ...trackIds,
  ];

  /** The pose editor displays the name of the pose as its title. */
  const PoseEditorTitle = (
    <EditorHeader
      editable={isCustom}
      title={pose?.name ?? "Pose"}
      setTitle={(name) =>
        pose && dispatch(updatePose({ data: { ...pose, name } }))
      }
      subtitle={category}
      color={"bg-gradient-to-tr from-pink-500 to-pink-600"}
    />
  );

  // Create an update function for a vector module.
  const updateBlock = useCallback(
    (index: number) => (block: PoseOperation) => {
      if (!id) return;
      dispatch(updatePoseBlock({ id, index, block }));
    },
    [id]
  );

  // Display a vector module.
  const isBucket = isPoseBucket(pose);
  const renderVectorModule = (module: PoseOperation, index: number) => {
    if (!pose) return null;
    return (
      <div
        className="flex w-full items-center p-2 gap-4"
        key={`module-${index}`}
      >
        <strong>Vector{isBucket ? "" : ` ${index + 1}`}:</strong>
        <PoseEditorVector
          {...props}
          pose={pose}
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
    <EditorContent>
      {PoseEditorTitle}
      <PoseEditorToolbar {...props} />
      {PoseEditorStream()}
    </EditorContent>
  );
}
