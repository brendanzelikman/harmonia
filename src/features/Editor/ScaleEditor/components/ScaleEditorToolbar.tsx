import { Editor } from "features/Editor/components";
import { Menu } from "@headlessui/react";
import { ScaleEditorProps } from "../ScaleEditor";
import { BsEraserFill, BsPencilFill, BsTrash } from "react-icons/bs";
import { getScaleAsArray } from "types/Scale";
import { useProjectDispatch } from "redux/hooks";
import {
  clearScale,
  createScale,
  exportScaleToMIDI,
  exportScaleToXML,
  playScale,
  rotateScale,
  transposeScale,
} from "redux/thunks";
import { UndoTypes } from "redux/undoTypes";
import { toggleEditorAction } from "redux/Editor";

export function ScaleEditorToolbar(props: ScaleEditorProps) {
  const { dispatch, scale, scaleName, isAdding, isRemoving, Button } = props;
  const notes = getScaleAsArray(scale);

  const ExportButton = () => (
    <Editor.Button
      label="Export Scale"
      options={[
        {
          onClick: () =>
            scale && dispatch(exportScaleToMIDI({ ...scale, name: scaleName })),
          label: "Export MIDI",
        },
        {
          onClick: () =>
            scale &&
            dispatch(exportScaleToXML({ ...scale, name: scaleName }, true)),
          label: "Export XML",
        },
      ]}
    >
      Export
    </Editor.Button>
  );

  const SaveButton = () => (
    <Button
      label="Save Scale"
      className="active:bg-sky-600"
      onClick={() => dispatch(createScale({ ...scale, name: scaleName }))}
    >
      Save
    </Button>
  );

  const UndoButton = () => (
    <Button
      label="Undo Last Action"
      weakClass="active:text-slate-400"
      onClick={() => dispatch({ type: UndoTypes.undoScales })}
      disabled={!props.canUndo}
      disabledClass="text-slate-500"
    >
      Undo
    </Button>
  );

  const RedoButton = () => (
    <Button
      label="Redo Last Action"
      weakClass="active:text-slate-400"
      onClick={() => dispatch({ type: UndoTypes.redoScales })}
      disabled={!props.canRedo}
      disabledClass="text-slate-500"
    >
      Redo
    </Button>
  );

  /** The user can play a preview of the scale. */
  const PlayButton = () => (
    <Button
      label="Play Scale"
      className="active:text-emerald-500"
      onClick={() => !!scale && dispatch(playScale(scale))}
      disabled={!notes.length}
    >
      Play
    </Button>
  );

  /** The user can add notes to the scale. */
  const AddButton = () => (
    <Button
      label={`${isAdding ? "Stop Adding" : "Add Notes"}`}
      active={isAdding}
      activeClass="text-emerald-400 animate-pulse"
      onClick={() => dispatch(toggleEditorAction("addingNotes"))}
    >
      <BsPencilFill className="text-lg" />
    </Button>
  );

  /** The user can remove notes from the scale. */
  const RemoveButton = () => (
    <Button
      label={`${isRemoving ? "Stop Removing" : "Remove Notes"}`}
      active={isRemoving}
      activeClass="text-red-400 animate-pulse"
      disabled={!notes.length}
      disabledClass="text-slate-500"
      onClick={() => dispatch(toggleEditorAction("removingNotes"))}
    >
      <BsEraserFill className="text-lg" />
    </Button>
  );

  /** The user can clear the notes of the scale. */
  const ClearButton = () => (
    <Button
      label="Clear Scale"
      weakClass="active:text-gray-400"
      onClick={() => dispatch(clearScale(props.scale?.id))}
      disabled={!notes.length}
      disabledClass="text-slate-500"
    >
      <BsTrash className="text-lg" />
    </Button>
  );

  /** The user can transpose the notes of the scale. */
  const TransposeButton = () => (
    <Button
      label="Transpose Scale"
      weakClass="active:bg-fuchsia-500/80"
      disabled={!notes.length}
      disabledClass="text-slate-500"
      prompt="Transpose scale by N semitones:"
      callback={(n: number) => dispatch(transposeScale(scale?.id, n))}
    >
      Transpose
    </Button>
  );

  /** The user can rotate the notes of the scale. */
  const RotateButton = () => (
    <Button
      label="Rotate Scale"
      weakClass={`active:bg-fuchsia-500/80`}
      disabled={!notes.length}
      disabledClass="text-slate-500"
      prompt="Rotate scale by N steps:"
      callback={(n: number) => dispatch(rotateScale(scale?.id, n))}
    >
      Rotate
    </Button>
  );

  /** The user can change the instrument of the scale. */
  const ScaleInstrumentListbox = () => (
    <Editor.InstrumentListbox
      value={props.instance?.key ?? "grand_piano"}
      setValue={props.setInstrument}
    />
  );

  return (
    <Editor.Tab show={true} border={false}>
      <Editor.TabGroup border={true}>
        <ExportButton />
        <SaveButton />
        <UndoButton />
        <RedoButton />
        <PlayButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <AddButton />
        <RemoveButton />
        <ClearButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <TransposeButton />
        <RotateButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={false}>
        <ScaleInstrumentListbox />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
