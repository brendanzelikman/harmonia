import { PatternEditorProps } from "../PatternEditor";
import { PatternEditorToolbar } from "./PatternEditorToolbar";
import { useMemo } from "react";
import { EditorContent } from "features/Editor/components/EditorContent";
import { EditorScore } from "features/Editor/components/EditorScore";
import { EditorHeader } from "features/Editor/components/EditorHeader";
import { PatternEditorActiveTab } from "./PatternEditorActiveTab";
import { getPatternCategory } from "types/Pattern/PatternFunctions";
import { updatePattern } from "types/Pattern/PatternSlice";
import { useProjectDispatch } from "types/hooks";
import { PatternEditorClock } from "./PatternEditorClock";
import { PatternEditorBlockTab } from "../tabs/PatternEditorBlockTab";

export function PatternEditorContent(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, isCustom, score, tabs, isAdding, isInserting, isRemoving } =
    props;
  const category = getPatternCategory(pattern);

  /** The pattern editor displays the name of the pattern as its title. */
  const PatternEditorTitle = useMemo(
    () => (
      <EditorHeader
        editable={isCustom}
        title={pattern?.name ?? "Pattern"}
        setTitle={(name) =>
          pattern && dispatch(updatePattern({ data: { ...pattern, name } }))
        }
        subtitle={category ?? "Category"}
        color={"bg-gradient-to-tr from-emerald-500 to-emerald-600"}
      />
    ),
    [pattern, isCustom, category]
  );

  const scoreBorder = isAdding
    ? "ring-emerald-500"
    : isInserting
    ? "ring-teal-500"
    : isRemoving
    ? "ring-red-500"
    : "ring-slate-950/0";

  return (
    <EditorContent className="mb-12">
      {PatternEditorTitle}
      <PatternEditorToolbar {...props} />
      <PatternEditorActiveTab {...props} />
      <EditorScore
        score={score}
        border="border-[6px]"
        className={`rounded border-slate-950 ring-4 my-4 outline-none ${scoreBorder} ${
          props.tab !== tabs[1] ? "block" : "hidden"
        }`}
      />
      {props.tab === tabs[1] && <PatternEditorClock {...props} />}
      <PatternEditorBlockTab {...props} />
    </EditorContent>
  );
}
