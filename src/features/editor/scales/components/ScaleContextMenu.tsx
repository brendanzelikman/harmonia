import { ScaleEditorProps } from "..";
import ContextMenu from "components/ContextMenu";

export function ScaleContextMenu(props: ScaleEditorProps) {
  const { scale } = props;
  if (!scale) return null;

  const options = [
    {
      label: "Undo Last Action",
      onClick: props.undoScales,
      disabled: !props.canUndoScales,
    },
    {
      label: "Redo Last Action",
      onClick: props.redoScales,
      disabled: !props.canRedoScales,
      divideEnd: true,
    },
    {
      label: "Save Scale",
      onClick: () => {
        props.createScale({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
    },
    {
      label: "Export Scale to MIDI",
      onClick: () => {
        props.exportScaleToMIDI({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
    },
    {
      label: "Export Scale to XML",
      onClick: () => {
        props.exportScaleToXML({ ...scale, name: props.scaleName });
      },
      disabled: !scale,
      divideEnd: true,
    },
    {
      label: `${props.adding ? "Stop" : "Start"}props. Adding Notes`,
      onClick: props.adding ? props.clear : () => props.setState("adding"),
      disabled: !scale,
    },
    {
      label: `${props.removing ? "Stop" : "Start"} Removing Notes`,
      onClick: props.removing ? props.clear : () => props.setState("removing"),
      disabled: !scale,
    },
    {
      label: "Clear Scale",
      onClick: () => props.clearScale(scale.id),
      disabled: !scale,
    },
  ];
  return (
    <ContextMenu
      options={options}
      targetId="scale-editor"
      className="-ml-[300px] -mt-4"
    />
  );
}
