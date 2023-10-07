import { ScaleEditorProps } from "..";
import ContextMenu from "components/ContextMenu";

export function ScaleContextMenu(props: ScaleEditorProps) {
  const { scale, scalePartial } = props;
  if (!scalePartial) return null;

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
        props.createScale({ ...scalePartial, name: props.scaleName });
      },
      disabled: !scalePartial,
    },
    {
      label: "Export Scale to MIDI",
      onClick: () => {
        props.exportScaleToMIDI({ ...scale, name: props.scaleName });
      },
      disabled: !scalePartial,
    },
    {
      label: "Export Scale to XML",
      onClick: () => {
        props.exportScaleToXML({ ...scale, name: props.scaleName });
      },
      disabled: !scalePartial,
      divideEnd: true,
    },
    {
      label: `${props.adding ? "Stop" : "Start"} Adding Notes`,
      onClick: props.adding ? props.clear : () => props.setState("adding"),
      disabled: !scalePartial,
    },
    {
      label: `${props.removing ? "Stop" : "Start"} Removing Notes`,
      onClick: props.removing ? props.clear : () => props.setState("removing"),
      disabled: !scalePartial,
    },
    {
      label: "Clear Scale",
      onClick: () =>
        props.scaleTrack ? props.clearScaleTrack(props.scaleTrack.id) : null,
      disabled: !scalePartial,
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
