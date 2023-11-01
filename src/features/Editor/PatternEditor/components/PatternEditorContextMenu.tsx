import { ContextMenu, ContextMenuOption } from "components/ContextMenu";
import { PatternEditorProps } from "../PatternEditor";
import { isEditorAddingNotes, isEditorInsertingNotes } from "types/Editor";
import {
  createPattern,
  exportPatternToMIDI,
  exportPatternToXML,
} from "redux/thunks";
import { toggleEditorAction } from "redux/Editor";
import { addPatternBlock, clearPattern } from "redux/Pattern";
import { getDurationTicks } from "utils/durations";

export function PatternEditorContextMenu(props: PatternEditorProps) {
  const { dispatch, undo, redo } = props;
  const { isCustom, isEmpty, pattern, cursor, canUndo, canRedo } = props;
  const id = pattern?.id;
  const duration = getDurationTicks(props.settings.note.duration);
  const isAdding = isEditorAddingNotes(props);
  const isInserting = isEditorInsertingNotes(props);

  // Undo Last Action
  const Undo: ContextMenuOption = {
    label: "Undo Last Action",
    onClick: undo,
    disabled: !canUndo,
  };

  // Redo Last Action
  const Redo: ContextMenuOption = {
    label: "Redo Last Action",
    onClick: redo,
    disabled: !canRedo,
    divideEnd: true,
  };

  // Toggle Adding Notes
  const Add: ContextMenuOption = {
    label: `${isAdding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => dispatch(toggleEditorAction("addingNotes")),
    disabled: !isCustom,
  };

  // Toggle Inserting Notes
  const Insert: ContextMenuOption = {
    label: `${isInserting ? "Stop" : "Start"} Inserting Notes`,
    onClick: () => dispatch(toggleEditorAction("insertingNotes")),
    disabled: !isCustom || props.cursor.hidden,
  };

  // Toggle Cursor
  const Cursor: ContextMenuOption = {
    label: `${props.cursor.hidden ? "Show" : "Hide"} Cursor`,
    onClick: props.cursor.toggle,
    disabled: isEmpty || !isCustom,
  };

  // Input Rest
  const Rest: ContextMenuOption = {
    label: `${isAdding ? "Add" : isInserting ? "Insert" : "Add"} Rest Note`,
    onClick: () => id && dispatch(addPatternBlock({ id, block: { duration } })),
    disabled: !isCustom || (!isAdding && !isInserting),
  };

  // Delete Note
  const Delete: ContextMenuOption = {
    label: "Delete Note",
    onClick: () => id && !cursor,
    disabled: !isCustom || isEmpty || props.cursor.hidden,
  };

  // Clear All Notes
  const Clear: ContextMenuOption = {
    label: "Clear All Notes",
    onClick: () => id && dispatch(clearPattern(id)),
    disabled: !props.pattern || isEmpty || !isCustom,
    divideEnd: true,
  };

  // Create New Pattern
  const NewPattern: ContextMenuOption = {
    label: "Create New Pattern",
    onClick: () => dispatch(createPattern()),
  };

  // Duplicate Pattern
  const DuplicatePattern: ContextMenuOption = {
    label: "Duplicate Pattern",
    onClick: () =>
      pattern && dispatch(createPattern({ name: `${pattern.name} Copy` })),
  };

  // Export Pattern to XML
  const ExportMIDI: ContextMenuOption = {
    label: "Export Pattern to MIDI",
    onClick: () => id && dispatch(exportPatternToMIDI(id)),
  };

  // Export Pattern to MusicXML
  const ExportXML: ContextMenuOption = {
    label: "Export Pattern to XML",
    onClick: () => dispatch(exportPatternToXML(pattern, true)),
  };

  // Compile the menu options
  const menuOptions = [
    Undo,
    Redo,
    isCustom ? Add : null,
    isCustom ? Insert : null,
    isCustom ? Cursor : null,
    isCustom ? Rest : null,
    isCustom ? Delete : null,
    isCustom ? Clear : null,
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
