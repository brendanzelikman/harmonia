import { PatternEditorContent } from "./PatternEditorContent";
import { PatternEditorContextMenu } from "./PatternEditorContextMenu";
import {
  PatternEditorSidebar,
  PresetPattern,
  CustomPattern,
} from "./PatternEditorSidebar";
import { PatternEditorPiano } from "./PatternEditorPiano";
import { PatternEditorChordTab } from "./PatternEditorChordTab";
import { PatternEditorComposeTab } from "./PatternEditorComposeTab";
import { PatternEditorToolbar } from "./PatternEditorToolbar";
import { PatternEditorRecordTab } from "./PatternEditorRecordTab";
import { PatternEditorBindingsTab } from "./PatternEditorBindingsTab";
import { PatternEditorTransformTab } from "./PatternEditorTransformTab";

const PatternEditor = {
  Content: PatternEditorContent,
  ContextMenu: PatternEditorContextMenu,
  Sidebar: PatternEditorSidebar,
  PresetPattern: PresetPattern,
  CustomPattern: CustomPattern,
  Piano: PatternEditorPiano,
  Toolbar: PatternEditorToolbar,
  ChordTab: PatternEditorChordTab,
  ComposeTab: PatternEditorComposeTab,
  RecordTab: PatternEditorRecordTab,
  SettingsTab: PatternEditorBindingsTab,
  TransformTab: PatternEditorTransformTab,
};

export { PatternEditor };
