import { Editor } from "features/Editor/components";
import { PoseEditorProps } from "../PoseEditor";
import {
  copyPose,
  createPose,
  randomizePoseStream,
  repeatPoseStream,
} from "redux/thunks";
import { addPoseBlock, clearPose } from "redux/Pose";
import { promptUserForNumber } from "utils/html";
import { DurationType, getDurationTicks } from "utils/durations";
import { useState } from "react";

export function PoseEditorToolbar(props: PoseEditorProps) {
  const { dispatch, pose, Button, isCustom } = props;
  if (!pose) return null;
  const id = pose.id;

  /** The user can create a new pose. */
  const NewButton = () => (
    <Button
      label="New Pose"
      className="active:bg-emerald-600"
      onClick={() => dispatch(createPose())}
    >
      New
    </Button>
  );

  /** The user can copy a pose. */
  const CopyButton = () => (
    <Button
      label="Copy Pose"
      weakClass="active:bg-teal-600"
      onClick={() => dispatch(copyPose(pose))}
    >
      Copy
    </Button>
  );

  /** The user can undo the pose history. */
  const UndoButton = () => (
    <Button
      label="Undo Last Action"
      weakClass="active:text-slate-400"
      onClick={props.undo}
      disabled={!props.canUndo || !isCustom}
      disabledClass="text-slate-500"
    >
      Undo
    </Button>
  );

  /** The user can redo the pose history. */
  const RedoButton = () => (
    <Button
      label="Redo Last Action"
      weakClass="active:text-slate-400"
      onClick={props.redo}
      disabled={!props.canRedo || !isCustom}
      disabledClass="text-slate-500"
    >
      Redo
    </Button>
  );

  /** The user can add a vector to the pose. */
  const VectorButton = () => (
    <Button
      label="Add a Vector"
      className={addingVector ? "text-emerald-500" : ""}
      onClick={() => setAddingVector(!addingVector)}
    >
      Add Vector
    </Button>
  );

  /** The user can clear the stream of the pose. */
  const RepeatButton = () => (
    <Button
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
    </Button>
  );

  /** The user can randomize the stream of the pose. */
  const RandomizeButton = () => (
    <Button
      label="Clear Pose Stream"
      onClick={() => dispatch(randomizePoseStream(id))}
      disabled={!pose.stream.length}
      disabledClass="text-slate-500"
    >
      Randomize Stream
    </Button>
  );

  /** The user can clear the stream of the pose. */
  const ClearButton = () => (
    <Button
      label="Clear Pose Stream"
      onClick={() => dispatch(clearPose(id))}
      disabled={!pose.stream.length}
      disabledClass="text-slate-500"
    >
      Clear Stream
    </Button>
  );

  const [addingVector, setAddingVector] = useState(false);
  const AddVectorButton = (duration: DurationType | "infinite") => {
    const ticks =
      duration === "infinite" ? undefined : getDurationTicks(duration);
    return (
      <Button
        label={`Add ${duration} Vector`}
        className="capitalize active:bg-emerald-600"
        onClick={() =>
          dispatch(addPoseBlock({ id, block: { vector: {}, duration: ticks } }))
        }
      >
        {duration} Vector
      </Button>
    );
  };

  return (
    <>
      <Editor.Tab show={true} border={true}>
        <Editor.TabGroup border={isCustom}>
          <NewButton />
          <CopyButton />
          {isCustom && (
            <>
              <UndoButton />
              <RedoButton />
            </>
          )}
        </Editor.TabGroup>
        {isCustom && (
          <Editor.TabGroup border={false}>
            <VectorButton />
            <RepeatButton />
            <RandomizeButton />
            <ClearButton />
          </Editor.TabGroup>
        )}
      </Editor.Tab>

      {isCustom && addingVector && (
        <Editor.Tab show={true} border={true}>
          <Editor.TabGroup border={false}>
            {AddVectorButton("infinite")}
            {AddVectorButton("whole")}
            {AddVectorButton("half")}
            {AddVectorButton("quarter")}
            {AddVectorButton("eighth")}
            {AddVectorButton("16th")}
            {AddVectorButton("32nd")}
            {AddVectorButton("64th")}
          </Editor.TabGroup>
        </Editor.Tab>
      )}
    </>
  );
}
