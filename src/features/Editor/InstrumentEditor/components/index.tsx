import { InstrumentEditorAnalyser } from "./InstrumentEditorAnalyser";
import { InstrumentEditorContent } from "./InstrumentEditorContent";
import { InstrumentEditorEffectBar } from "./InstrumentEditorEffectBar";
import { InstrumentEditorEffects } from "./InstrumentEditorEffects";
import { InstrumentEditorSidebar } from "./InstrumentEditorSidebar";
import { InstrumentEditorPiano } from "./InstrumentEditorPiano";

const InstrumentEditor = {
  Analyser: InstrumentEditorAnalyser,
  Content: InstrumentEditorContent,
  EffectBar: InstrumentEditorEffectBar,
  Effects: InstrumentEditorEffects,
  Piano: InstrumentEditorPiano,
  Sidebar: InstrumentEditorSidebar,
};

export { InstrumentEditor };
