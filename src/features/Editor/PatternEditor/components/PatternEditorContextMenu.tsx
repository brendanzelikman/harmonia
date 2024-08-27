import { ContextMenu, ContextMenuOption } from "components/ContextMenu";
import { PatternEditorProps } from "../PatternEditor";
import { getDurationTicks } from "utils/durations";
import {
  isEditorAddingNotes,
  isEditorInsertingNotes,
} from "types/Editor/EditorFunctions";
import { toggleEditorAction } from "types/Editor/EditorSlice";
import { addPatternBlock } from "types/Pattern/PatternSlice";
import { useProjectDispatch } from "types/hooks";
import { exportPatternToMIDI } from "types/Pattern/PatternExporters";
import {
  clearPattern,
  createPattern,
  downloadPatternAsXML,
} from "types/Pattern/PatternThunks";

export function PatternEditorContextMenu(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { isCustom, isEmpty, pattern, cursor } = props;
  const id = pattern?.id;
  const duration = getDurationTicks(props.settings.note.duration);
  const isAdding = isEditorAddingNotes(props);
  const isInserting = isEditorInsertingNotes(props);

  // Toggle Adding Notes
  const Add: ContextMenuOption = {
    label: `${isAdding ? "Stop" : "Start"} Adding Notes`,
    onClick: () => dispatch(toggleEditorAction({ data: "addingNotes" })),
    disabled: !isCustom,
  };

  // Toggle Inserting Notes
  const Insert: ContextMenuOption = {
    label: `${isInserting ? "Stop" : "Start"} Inserting Notes`,
    onClick: () => dispatch(toggleEditorAction({ data: "insertingNotes" })),
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
      pattern &&
      dispatch(createPattern({ data: { name: `${pattern.name} Copy` } })),
  };

  // Export Pattern to XML
  const ExportMIDI: ContextMenuOption = {
    label: "Export Pattern to MIDI",
    onClick: () => id && dispatch(exportPatternToMIDI(id)),
  };

  // Export Pattern to MusicXML
  const ExportXML: ContextMenuOption = {
    label: "Export Pattern to XML",
    onClick: () => id && dispatch(downloadPatternAsXML(id)),
  };

  // Compile the menu options
  const menuOptions = [
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
