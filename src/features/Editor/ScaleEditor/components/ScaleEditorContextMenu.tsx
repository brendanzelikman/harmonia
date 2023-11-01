import { ScaleEditorProps } from "../ScaleEditor";
import { ContextMenu } from "components/ContextMenu";
import { UndoTypes } from "redux/undoTypes";
import {
  clearScale,
  createScale,
  exportScaleToMIDI,
  exportScaleToXML,
} from "redux/thunks";
import { toggleEditorAction } from "redux/Editor";

export function ScaleEditorContextMenu(props: ScaleEditorProps) {
  const { scale, scaleName, isAdding, isRemoving, canUndo, canRedo } = props;

  // Undo Last Action
  const Undo = {
    label: "Undo Last Action",
    onClick: () => props.dispatch({ type: UndoTypes.undoScales }),
    disabled: !canUndo,
  };

  // Redo Last Action
  const Redo = {
    label: "Redo Last Action",
    onClick: () => props.dispatch({ type: UndoTypes.redoScales }),
    disabled: !canRedo,
    divideEnd: true,
  };

  // Save Scale
  const Save = {
    label: "Save Scale",
    onClick: () => {
      if (!scale) return;
      props.dispatch(createScale({ ...scale, name: scaleName }));
    },
    disabled: !scale,
  };

  // Export Scale to MIDI
  const ExportMIDI = {
    label: "Export Scale to MIDI",
    onClick: () => {
      if (!scale) return;
      props.dispatch(exportScaleToMIDI({ ...scale, name: scaleName }));
    },
    disabled: !scale,
  };

  // Export Scale to MusicXML
  const ExportXML = {
    label: "Export Scale to XML",
    onClick: () => {
      if (!scale) return;
      props.dispatch(exportScaleToXML({ ...scale, name: scaleName }, true));
    },
    disabled: !scale,
    divideEnd: true,
  };

  // Toggle Adding Notes
  const Add = {
    label: `${isAdding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => props.dispatch(toggleEditorAction("addingNotes")),
    disabled: !scale,
  };

  // Toggle Removing Notes
  const Remove = {
    label: `${isRemoving ? "Stop" : "Start"} Removing Notes`,
    onClick: () => props.dispatch(toggleEditorAction("removingNotes")),
    disabled: !scale,
  };

  // Clear Scale
  const Clear = {
    label: "Clear Scale",
    onClick: () => clearScale(scale?.id),
    disabled: !scale?.id,
  };

  const options = [Undo, Redo, Save, ExportMIDI, ExportXML, Add, Remove, Clear];
  return (
    <ContextMenu
      options={options}
      targetId="scale-editor"
      className="-ml-[300px] -mt-4"
    />
  );
}
