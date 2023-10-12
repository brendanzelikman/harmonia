import ContextMenu, { ContextMenuOption } from "components/ContextMenu";
import { PatternEditorCursorProps } from "..";

interface PatternContextMenuProps extends PatternEditorCursorProps {
  onRestClick: () => void;
  onEraseClick: () => void;
}

export function PatternContextMenu(props: PatternContextMenuProps) {
  // Undo Last Action
  const Undo: ContextMenuOption = {
    label: "Undo Last Action",
    onClick: props.undoPatterns,
    disabled: !props.canUndoPatterns,
  };

  // Redo Last Action
  const Redo: ContextMenuOption = {
    label: "Redo Last Action",
    onClick: props.redoPatterns,
    disabled: !props.canRedoPatterns,
    divideEnd: true,
  };

  // Toggle Adding Notes
  const Add: ContextMenuOption = {
    label: `${props.adding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => props.toggleState("adding"),
    disabled: !props.isCustom,
  };

  // Toggle Inserting Notes
  const Insert: ContextMenuOption = {
    label: `${props.inserting ? "Stop" : "Start"} Inserting Notes`,
    onClick: () => props.toggleState("inserting"),
    disabled: !props.isCustom || props.cursor.hidden,
  };

  // Toggle Cursor
  const Cursor: ContextMenuOption = {
    label: `${props.cursor.hidden ? "Show" : "Hide"} Cursor`,
    onClick: props.cursor.toggle,
    disabled: props.isEmpty || !props.isCustom,
  };

  // Input Rest
  const Rest: ContextMenuOption = {
    label: `${
      props.adding ? "Add" : props.inserting ? "Insert" : "Add"
    } Rest Note`,
    onClick: props.onRestClick,
    disabled: !props.isCustom || (!props.adding && !props.inserting),
  };

  // Delete Note
  const Delete: ContextMenuOption = {
    label: "Delete Note",
    onClick: props.onEraseClick,
    disabled: !props.isCustom || props.isEmpty || props.cursor.hidden,
  };

  // Clear All Notes
  const Clear: ContextMenuOption = {
    label: "Clear All Notes",
    onClick: props.clearPattern,
    disabled: !props.pattern || props.isEmpty || !props.isCustom,
    divideEnd: true,
  };

  // Create New Pattern
  const NewPattern: ContextMenuOption = {
    label: "Create New Pattern",
    onClick: props.createPattern,
  };

  // Duplicate Pattern
  const DuplicatePattern: ContextMenuOption = {
    label: "Duplicate Pattern",
    onClick: () => props.copyPattern(props.pattern),
  };

  // Export Pattern to XML
  const ExportMIDI: ContextMenuOption = {
    label: "Export Pattern to MIDI",
    onClick: () => props.exportPatternToMIDI(props.pattern),
  };

  // Export Pattern to XML
  const ExportXML: ContextMenuOption = {
    label: "Export Pattern to XML",
    onClick: () => props.exportPatternToXML(props.pattern),
  };

  // Compile the menu options
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

  // Render the menu
  return (
    <ContextMenu
      options={options}
      targetId="pattern-editor"
      className={`-ml-[300px] -mt-4`}
    />
  );
}
