import { PoseEditorProps } from "../PoseEditor";
import { promptUserForNumber } from "utils/html";
import { DurationType, getDurationTicks } from "utils/durations";
import { useState } from "react";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { useProjectDispatch } from "types/hooks";
import { clearPose, addPoseBlock } from "types/Pose/PoseSlice";
import {
  createPose,
  copyPose,
  repeatPoseStream,
  randomizePoseStream,
} from "types/Pose/PoseThunks";
import { EditorButton } from "features/Editor/components/EditorButton";

export function PoseEditorToolbar(props: PoseEditorProps) {
  const dispatch = useProjectDispatch();
  const { pose, isCustom } = props;
  if (!pose) return null;
  const id = pose.id;

  /** The user can create a new pose. */
  const NewButton = () => (
    <EditorButton
      label="New Pose"
      className="active:bg-emerald-600"
      onClick={() => dispatch(createPose())}
    >
      New
    </EditorButton>
  );

  /** The user can copy a pose. */
  const CopyButton = () => (
    <EditorButton
      label="Copy Pose"
      className="active:bg-teal-600"
      onClick={() => dispatch(copyPose(pose))}
    >
      Copy
    </EditorButton>
  );

  /** The user can add a vector to the pose. */
  const VectorButton = () => (
    <EditorButton
      label="Add a Vector"
      className={addingVector ? "text-emerald-500" : ""}
      onClick={() => setAddingVector(!addingVector)}
    >
      Add Vector
    </EditorButton>
  );

  /** The user can clear the stream of the pose. */
  const RepeatButton = () => (
    <EditorButton
      label="Repeat Pose Stream"
      onClick={promptUserForNumber(
        "Repeat Your Stream",
        "How many times would you like to repeat this stream?",
        (value) => dispatch(repeatPoseStream(pose.id, value))
      )}
      disabled={!pose.stream.length}
      disabledClass="text-slate-500"
    >
      Repeat Stream
    </EditorButton>
  );

  /** The user can randomize the stream of the pose. */
  const RandomizeButton = () => (
    <EditorButton
      label="Clear Pose Stream"
      onClick={() => dispatch(randomizePoseStream(id))}
      disabled={!pose.stream.length}
      disabledClass="text-slate-500"
    >
      Randomize Stream
    </EditorButton>
  );

  /** The user can clear the stream of the pose. */
  const ClearButton = () => (
    <EditorButton
      label="Clear Pose Stream"
      onClick={() => dispatch(clearPose(id))}
      disabled={!pose.stream.length}
      disabledClass="text-slate-500"
    >
      Clear Stream
    </EditorButton>
  );

  const [addingVector, setAddingVector] = useState(false);
  const AddVectorButton = (duration: DurationType | "infinite") => {
    const ticks =
      duration === "infinite" ? undefined : getDurationTicks(duration);
    return (
      <EditorButton
        label={`Add ${duration} Vector`}
        className="capitalize active:bg-emerald-600"
        onClick={() =>
          dispatch(addPoseBlock({ id, block: { vector: {}, duration: ticks } }))
        }
      >
        {duration} Vector
      </EditorButton>
    );
  };

  return (
    <>
      <EditorTab show={true} border={true}>
        <EditorTabGroup border={isCustom}>
          <NewButton />
          <CopyButton />
        </EditorTabGroup>
        {isCustom && (
          <EditorTabGroup border={false}>
            <VectorButton />
            <RepeatButton />
            <RandomizeButton />
            <ClearButton />
          </EditorTabGroup>
        )}
      </EditorTab>

      {isCustom && addingVector && (
        <EditorTab show={true} border={true}>
          <EditorTabGroup border={false}>
            {AddVectorButton("infinite")}
            {AddVectorButton("whole")}
            {AddVectorButton("half")}
            {AddVectorButton("quarter")}
            {AddVectorButton("eighth")}
            {AddVectorButton("16th")}
            {AddVectorButton("32nd")}
            {AddVectorButton("64th")}
          </EditorTabGroup>
        </EditorTab>
      )}
    </>
  );
}
