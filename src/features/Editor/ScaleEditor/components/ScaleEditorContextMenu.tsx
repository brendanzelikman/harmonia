import { ScaleEditorProps } from "../ScaleEditor";
import { ContextMenu } from "components/ContextMenu";
import { toggleEditorAction } from "types/Editor/EditorSlice";
import { useProjectDispatch } from "types/hooks";
import {
  exportScaleToMIDI,
  exportScaleToXML,
} from "types/Scale/ScaleExporters";
import { createScale, clearScale } from "types/Scale/ScaleThunks";

export function ScaleEditorContextMenu(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { scale, midiScale, scaleName, isAdding, isRemoving } = props;

  // Save Scale
  const Save = {
    label: "Save Scale",
    onClick: () => {
      if (!scale) return;
      dispatch(createScale({ data: { ...scale, name: scaleName } }));
    },
    disabled: !scale,
  };

  // Export Scale to MIDI
  const ExportMIDI = {
    label: "Export Scale to MIDI",
    onClick: () => {
      if (!scale) return;
      dispatch(exportScaleToMIDI(midiScale));
    },
    disabled: !scale,
  };

  // Export Scale to MusicXML
  const ExportXML = {
    label: "Export Scale to XML",
    onClick: () => {
      if (!scale) return;
      exportScaleToXML(midiScale, true);
    },
    disabled: !scale,
    divideEnd: true,
  };

  // Toggle Adding Notes
  const Add = {
    label: `${isAdding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => dispatch(toggleEditorAction({ data: "addingNotes" })),
    disabled: !scale,
  };

  // Toggle Removing Notes
  const Remove = {
    label: `${isRemoving ? "Stop" : "Start"} Removing Notes`,
    onClick: () => dispatch(toggleEditorAction({ data: "removingNotes" })),
    disabled: !scale,
  };

  // Clear Scale
  const Clear = {
    label: "Clear Scale",
    onClick: () => dispatch(clearScale(scale?.id)),
    disabled: !scale?.id,
  };

  const options = [Save, ExportMIDI, ExportXML, Add, Remove, Clear];
  return (
    <ContextMenu
      options={options}
      targetId="scale-editor"
      className="-ml-[300px] -mt-4"
    />
  );
}
