import { EditorTooltipButton } from "components/TooltipButton";
import { EditorTabGroup } from "features/Editor/components/EditorTab";
import { useCallback } from "react";
import { PatternEditorProps } from "../PatternEditor";

export const PatternEditorTabs = (props: PatternEditorProps) => {
  const Tabs = useCallback(() => {
    return props.tabs.map((tab) => {
      const onTab = props.tab === tab;
      const color = onTab ? "text-green-400" : "text-gray-300";
      return (
        <EditorTooltipButton
          key={tab}
          className={`${color} mx-1 p-2 text-sm font-semibold capitalize cursor-pointer select-none`}
          onClick={() => props.setTab(tab)}
        >
          {tab}
        </EditorTooltipButton>
      );
    });
  }, [props.tab, props.tabs, props.setTab]);

  return (
    <EditorTabGroup>
      <div className="flex items-center font-light">
        <span className="text-emerald-400 font-thin pr-2">Tab:</span>
        {Tabs()}
      </div>
    </EditorTabGroup>
  );
};
