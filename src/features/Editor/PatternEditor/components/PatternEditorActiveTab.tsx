import { PatternEditorProps } from "../PatternEditor";
import { PatternEditorBindingsTab } from "../tabs/PatternEditorBindingsTab";
import { PatternEditorChordTab } from "../tabs/PatternEditorChordTab";
import { PatternEditorClockTab } from "../tabs/PatternEditorClockTab";
import { PatternEditorComposeTab } from "../tabs/PatternEditorComposeTab";
import { PatternEditorTransformTab } from "../tabs/PatternEditorTransformTab";

export const PatternEditorActiveTab = (props: PatternEditorProps) => {
  const { tab, tabs, isCustom } = props;
  if (!isCustom) return null;
  return (
    <div className="h-14 mt-4 flex items-center bg-slate-900/90 rounded border border-emerald-500">
      {tab === tabs[0] && <PatternEditorComposeTab {...props} />}
      {tab === tabs[1] && <PatternEditorClockTab {...props} />}
      {tab === tabs[2] && <PatternEditorBindingsTab {...props} />}
      {tab === tabs[3] && <PatternEditorTransformTab {...props} />}
      {tab === tabs[4] && <PatternEditorChordTab {...props} />}
    </div>
  );
};
