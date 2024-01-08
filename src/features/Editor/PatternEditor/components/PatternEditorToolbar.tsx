import { capitalize } from "lodash";
import {
  copyPattern,
  createPattern,
  exportPatternToMIDI,
  exportPatternToXML,
  playPattern,
} from "redux/thunks";
import { Editor } from "features/Editor/components";
import { PatternEditorTabProps } from "./PatternEditorContent";
import { useEffect } from "react";
import { useSubscription } from "providers/subscription";

export function PatternEditorToolbar(props: PatternEditorTabProps) {
  const { dispatch, pattern, isEmpty, Button, onChord } = props;
  const subscription = useSubscription();

  /** The user can create a new pattern. */
  const NewButton = () => (
    <Button
      label="New Pattern"
      className="active:bg-emerald-600"
      onClick={() => dispatch(createPattern())}
    >
      New
    </Button>
  );

  /** The user can copy a pattern. */
  const CopyButton = () => (
    <Button
      label="Copy Pattern"
      weakClass="active:bg-teal-600"
      onClick={() => dispatch(copyPattern(pattern))}
      disabled={props.isEmpty}
    >
      Copy
    </Button>
  );

  /** The user can export a pattern to MIDI or MusicXML. */
  const ExportButton = () => {
    if (subscription.isProdigy) return null;
    return (
      <Button
        label="Export Pattern"
        disabled={isEmpty}
        disabledClass="text-slate-500"
        weakClass="active:bg-slate-600 cursor-pointer"
        options={[
          {
            onClick: () => dispatch(exportPatternToMIDI(pattern?.id)),
            label: "Export MIDI",
          },
          {
            onClick: () => dispatch(exportPatternToXML(pattern)),
            label: "Export XML",
          },
        ]}
      >
        Export
      </Button>
    );
  };

  /** The user can undo the pattern history. */
  const UndoButton = () => (
    <Button
      label="Undo Last Action"
      weakClass="active:text-slate-400"
      onClick={props.undo}
      disabled={!props.canUndo}
      disabledClass="text-slate-500"
    >
      Undo
    </Button>
  );

  /** The user can redo the pattern history. */
  const RedoButton = () => (
    <Button
      label="Redo Last Action"
      weakClass="active:text-slate-400"
      onClick={props.redo}
      disabled={!props.canRedo}
      disabledClass="text-slate-500"
    >
      Redo
    </Button>
  );

  /** The user can play the pattern. */
  const PlayButton = () => (
    <Button
      label="Play Pattern"
      weakClass="active:bg-emerald-600"
      disabled={props.isEmpty}
      onClick={() => dispatch(playPattern(pattern))}
    >
      Play
    </Button>
  );

  /** The user can select a pattern editor tab. */
  const tabs = [
    "compose",
    onChord ? "edit" : undefined,
    "transform",
    "settings",
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (props.tab === "edit" && !onChord) props.setTab("compose");
  }, [onChord, props.tab]);

  const PatternEditorTabs = () => (
    <div className="flex items-center font-light text-xs">
      {tabs.map((tab) => {
        const onTab = props.tab === tab;
        const color = onTab ? "text-green-400" : "text-slate-500";
        return (
          <Button
            key={tab}
            label={`Select ${capitalize(tab)} Tab`}
            className={`${color} mx-1 capitalize cursor-pointer select-none`}
            onClick={() => props.setTab(tab)}
          >
            {tab}
          </Button>
        );
      })}
    </div>
  );

  return (
    <Editor.Tab className="z-20" show={true} border={true}>
      <Editor.TabGroup border={props.isCustom}>
        <ExportButton />
        <NewButton />
        <CopyButton />
        <PlayButton />
      </Editor.TabGroup>
      {!!props.isCustom && (
        <Editor.TabGroup border={true}>
          <UndoButton />
          <RedoButton />
        </Editor.TabGroup>
      )}
      {!!props.isCustom && <PatternEditorTabs />}
    </Editor.Tab>
  );
}
