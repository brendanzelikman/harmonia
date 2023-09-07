import { useEffect, useMemo, useState } from "react";
import Patterns from "types/pattern";
import * as Editor from "features/editor";
import useOSMD from "lib/opensheetmusicdisplay";
import { Transition } from "@headlessui/react";
import { getGlobalInstrumentName, getGlobalSampler } from "types/instrument";
import usePatternShortcuts from "./hooks/usePatternShortcuts";
import { PatternEditorProps } from ".";
import { Duration, Timing } from "types/units";
import { Input } from "webmidi";
import {
  PatternComposeTab,
  PatternContextMenu,
  PatternControlTab,
  PatternList,
  PatternPiano,
  PatternRecordTab,
  PatternTransformTab,
} from "./components";

export const patternTabs = ["compose", "record", "transform"];
export type PatternTab = (typeof patternTabs)[number];

export function PatternEditor(props: PatternEditorProps) {
  // Editor state
  const { inserting, pattern, scale } = props;
  const [activeTab, setActiveTab] = useState<PatternTab>("compose");

  // Score information
  const xml = useMemo(() => {
    return Patterns.exportToXML(pattern, scale);
  }, [pattern, scale]);

  const { score, cursor } = useOSMD({
    id: `${pattern?.id ?? "pattern"}-score`,
    xml,
    className: "w-full h-full p-2",
    noteCount: pattern?.stream.length || 0,
    options: {
      drawTimeSignatures: false,
    },
  });
  const cursorProps = { ...props, cursor };

  // Input information
  const [input, setInput] = useState<Input>();
  const inputProps = { input, setInput };

  // Clear editor state if inserting when cursor is hidden
  useEffect(() => {
    if (cursor.hidden && inserting) props.clear();
  }, [cursor.hidden, inserting]);

  //
  // Clear editor state for non-custom patterns
  // Set to major chord as backup
  useEffect(() => {
    if (props.isCustom) props.setState("adding");
    if (!props.isCustom) props.clear();
    if (!pattern) props.setPatternId("major-chord");
  }, [props.isCustom, pattern]);

  // Sampler information
  const [sampler, setSampler] = useState(getGlobalSampler());
  const [instrument, setInstrument] = useState(getGlobalInstrumentName() || "");

  // Switch sampler with delay (to update state properly)
  useEffect(() => {
    setTimeout(() => {
      const sampler = getGlobalSampler();
      setSampler(sampler);
    }, 100);
  }, [instrument]);

  // Function props based on current pattern and cursor
  const onRestClick = () => {
    props.onRestClick(pattern, cursor);
  };
  const onEraseClick = () => {
    props.onEraseClick(pattern, cursor);
  };
  const onDurationClick = (duration: Duration) => {
    props.onDurationClick(duration, pattern, cursor);
  };
  const onTimingClick = (timing: Timing) => {
    props.onTimingClick(timing, pattern, cursor);
  };
  const funcProps = {
    onRestClick,
    onEraseClick,
    onDurationClick,
    onTimingClick,
  };

  // Shortcut hook
  usePatternShortcuts({
    ...props,
    cursor,
    onDurationClick,
  });

  if (!pattern) return null;

  return (
    <Editor.Container
      className={`text-white h-full absolute top-0 w-full`}
      id="pattern-editor"
    >
      <PatternContextMenu {...cursorProps} {...funcProps} />
      <Editor.Body>
        <Transition
          show={props.showingPresets}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Editor.Sidebar className={`ease-in-out duration-300`}>
            <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2">
              Preset Patterns
            </Editor.SidebarHeader>
            <PatternList {...props} />
          </Editor.Sidebar>
        </Transition>

        <Editor.Content>
          <Editor.Title
            editable={props.isCustom}
            title={pattern.name ?? "Pattern"}
            setTitle={(name) => props.setPatternName(pattern, name)}
            subtitle={props.patternCategory ?? "Category"}
            color={"bg-gradient-to-tr from-emerald-500 to-emerald-600"}
          />

          <Editor.MenuRow show={true} border={true}>
            <PatternControlTab
              {...cursorProps}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setInstrument={setInstrument}
            />
          </Editor.MenuRow>
          <Editor.MenuRow show={props.isCustom} border={true}>
            {activeTab === "compose" && (
              <PatternComposeTab {...cursorProps} {...funcProps} />
            )}
            {activeTab === "record" && (
              <PatternRecordTab {...cursorProps} {...inputProps} />
            )}
            {activeTab === "transform" && (
              <PatternTransformTab {...cursorProps} />
            )}
          </Editor.MenuRow>
          <Editor.ScoreContainer className={`bg-white/90 mt-2 rounded-lg`}>
            {score}
          </Editor.ScoreContainer>
        </Editor.Content>
      </Editor.Body>
      <PatternPiano {...cursorProps} sampler={sampler} />
    </Editor.Container>
  );
}
