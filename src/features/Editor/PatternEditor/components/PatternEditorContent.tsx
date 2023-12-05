import { updatePattern } from "redux/Pattern";
import { PatternEditorProps } from "../PatternEditor";
import { PatternEditorToolbar } from "./PatternEditorToolbar";
import { Editor } from "features/Editor/components";
import { getPatternCategory } from "types/Pattern";
import { PatternEditorComposeTab } from "./PatternEditorComposeTab";
import { PatternEditorRecordTab } from "./PatternEditorRecordTab";
import { PatternEditorSettingsTab } from "./PatternEditorSettingsTab";
import { PatternEditorTransformTab } from "./PatternEditorTransformTab";
import { useState } from "react";
import { PatternEditorChordTab } from "./PatternEditorChordTab";

export interface PatternEditorTabProps extends PatternEditorProps {
  tab: string;
  setTab: (t: string) => void;
}

export function PatternEditorContent(props: PatternEditorProps) {
  const { dispatch, pattern, isCustom, score } = props;
  const category = getPatternCategory(pattern);

  /** The pattern editor can have a tab open */
  const [tab, setTab] = useState("compose");

  /** The pattern editor tab passes down props to the toolbar. */
  const patternEditorTabProps: PatternEditorTabProps = {
    ...props,
    tab,
    setTab,
  };

  /** The pattern editor displays the name of the pattern as its title. */
  const PatternEditorTitle = (
    <Editor.Header
      editable={isCustom}
      title={pattern?.name ?? "Pattern"}
      setTitle={(name) =>
        pattern && dispatch(updatePattern({ ...pattern, name }))
      }
      subtitle={category ?? "Category"}
      color={"bg-gradient-to-tr from-emerald-500 to-emerald-600"}
    />
  );

  return (
    <Editor.Content>
      {PatternEditorTitle}
      <PatternEditorToolbar {...patternEditorTabProps} />
      {tab === "compose" && <PatternEditorComposeTab {...props} />}
      {tab === "edit" && <PatternEditorChordTab {...props} />}
      {tab === "record" && <PatternEditorRecordTab {...props} />}
      {tab === "transform" && <PatternEditorTransformTab {...props} />}
      {tab === "settings" && <PatternEditorSettingsTab {...props} />}
      <Editor.Score className={`bg-white/90 mt-2`} score={score} />
    </Editor.Content>
  );
}
