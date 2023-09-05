import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { PatternEditorCursorProps } from "..";

interface PatternContextMenuProps extends PatternEditorCursorProps {
  onRestClick: () => void;
  onEraseClick: () => void;
}

export function PatternContextMenu(props: PatternContextMenuProps) {
  const Undo = {
    label: "Undo Last Action",
    onClick: props.undoPatterns,
    disabled: !props.canUndoPatterns,
  };
  const Redo = {
    label: "Redo Last Action",
    onClick: props.redoPatterns,
    disabled: !props.canRedoPatterns,
    divideEnd: true,
  };
  const Add = {
    label: `${props.adding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => {
      if (props.adding) {
        props.clear();
      } else {
        props.setState("adding");
      }
    },
    disabled: !props.isCustom,
  };
  const Insert = {
    label: `${props.inserting ? "Stop" : "Start"} Inserting Notes`,
    onClick: () => {
      if (props.inserting) {
        props.clear();
      } else {
        props.setState("inserting");
      }
    },
    disabled: !props.isCustom || props.cursor.hidden,
  };
  const Cursor = {
    label: `${props.cursor.hidden ? "Show" : "Hide"} Cursor`,
    onClick: () => {
      if (props.cursor.hidden) {
        props.cursor.show();
      } else {
        props.cursor.hide();
      }
    },
    disabled: props.isEmpty || !props.isCustom,
  };
  const Rest = {
    label: `${
      props.adding ? "Add" : props.inserting ? "Insert" : "Add"
    } Rest Note`,
    onClick: props.onRestClick,
    disabled: !props.isCustom || (!props.adding && !props.inserting),
  };
  const Delete = {
    label: "Delete Note",
    onClick: props.onEraseClick,
    disabled: !props.isCustom || props.isEmpty || props.cursor.hidden,
  };
  const Clear = {
    label: "Clear All Notes",
    onClick: () => (props.pattern ? props.clearPattern(props.pattern) : null),
    disabled: !props.pattern || props.isEmpty || !props.isCustom,
    divideEnd: true,
  };
  const NewPattern = {
    label: "Create New Pattern",
    onClick: async () => {
      const patternId = await props.createPattern();
      props.setPatternId(patternId);
    },
  };
  const DuplicatePattern = {
    label: "Duplicate Pattern",
    onClick: () => props.copyPattern(props.pattern),
  };
  const ExportMIDI = {
    label: "Export Pattern to MIDI",
    onClick: () => props.exportPatternToMIDI(props.pattern),
  };
  const ExportXML = {
    label: "Export Pattern to XML",
    onClick: () => props.exportPatternToXML(props.pattern),
  };

  const menuOptions = [
    Undo,
    Redo,
    props.isCustom ? Add : null,
    props.isCustom ? Insert : null,
    props.isCustom ? Cursor : null,
    props.isCustom ? Rest : null,
    props.isCustom ? Delete : null,
    props.isCustom ? Clear : null,
    NewPattern,
    DuplicatePattern,
    ExportMIDI,
    ExportXML,
  ];
  const options = menuOptions.filter(Boolean) as ContextMenuOption[];

  return (
    <ContextMenu
      options={options}
      targetId="pattern-editor"
      className={`-ml-[300px] -mt-4`}
    />
  );
}
