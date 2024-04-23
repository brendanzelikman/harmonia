import { updatePattern } from "redux/Pattern";
import { PatternEditorProps } from "../PatternEditor";
import { PatternEditorToolbar } from "./PatternEditorToolbar";
import { Editor } from "features/Editor/components";
import { getPatternCategory } from "types/Pattern";
import { PatternEditorComposeTab } from "./PatternEditorComposeTab";
import { PatternEditorBindingsTab } from "./PatternEditorBindingsTab";
import { PatternEditorTransformTab } from "./PatternEditorTransformTab";
import { useState } from "react";
import { PatternEditorChordTab } from "./PatternEditorChordTab";

export interface PatternEditorTabProps extends PatternEditorProps {
  tab: string;
  setTab: (t: string) => void;
}

export function PatternEditorContent(props: PatternEditorProps) {
  const { dispatch, pattern, onChord, isCustom, score, tabs } = props;
  const category = getPatternCategory(pattern);

  /** The pattern editor can have a tab open */
  const [tab, setTab] = useState(tabs[0]);

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
      {tab === tabs[0] && <PatternEditorComposeTab {...props} />}
      {tab === tabs[1] && <PatternEditorBindingsTab {...props} />}
      {tab === tabs[2] && onChord && <PatternEditorChordTab {...props} />}
      {(tab === tabs[3] || (tab === tabs[2] && !onChord)) && (
        <PatternEditorTransformTab {...props} />
      )}
      <Editor.Score className={`bg-white/90 mt-2`} score={score} />
    </Editor.Content>
  );
}
