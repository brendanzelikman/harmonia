import { useEffect, useMemo, useState } from "react";
import { defaultPattern, exportPatternToXML } from "types/Pattern";
import * as Editor from "features/Editor";
import useOSMD from "lib/opensheetmusicdisplay";
import { Transition } from "@headlessui/react";
import { InstrumentKey, LIVE_AUDIO_INSTANCES } from "types/Instrument";
import usePatternHotkeys from "../hooks/usePatternHotkeys";
import { PatternEditorProps } from "..";
import { Duration, Timing } from "types/units";
import { Input } from "webmidi";
import {
  PatternContextMenu,
  PatternList,
  PatternPiano,
  PatternComposeTab,
  PatternControlTab,
  PatternRecordTab,
  PatternSettingsTab,
  PatternTranspositionTab,
} from ".";

import { PresetScaleMap } from "presets/scales";
import { chromaticScale } from "types/Scale";
import { createGlobalInstrument } from "redux/thunks";

export const PATTERN_TABS = ["compose", "transform", "record", "settings"];
export type PatternTab = (typeof PATTERN_TABS)[number];

export function PatternEditor(props: PatternEditorProps) {
  const { adding, inserting, pattern } = props;

  // Set pattern to major chord as default
  useEffect(() => {
    if (!pattern) props.setSelectedPattern("major-chord");
  }, [pattern]);

  const { scaleId, quantizeToScale, instrumentKey } = {
    ...defaultPattern.options,
    ...pattern?.options,
  };

  const currentScale =
    scaleId && quantizeToScale
      ? PresetScaleMap[scaleId] ?? chromaticScale
      : chromaticScale;

  // Score information
  const xml = useMemo(() => exportPatternToXML(pattern), [pattern]);

  const { score, cursor } = useOSMD({
    id: `${pattern?.id ?? "pattern"}-score`,
    xml,
    className: "w-full h-full p-2",
    noteCount: pattern?.stream.length || 0,
    options: { drawTimeSignatures: false },
  });
  const cursorProps = { ...props, cursor };

  // Keep track of tabs
  const [activeTab, setActiveTab] = useState<PatternTab>("compose");

  // Input information
  const [input, setInput] = useState<Input>();
  const inputProps = { input, setInput };

  // Clear editor state for non-custom patterns
  // Start on adding state for custom patterns
  useEffect(() => {
    if (props.isCustom) {
      if (adding || inserting) return;
      props.setState("adding");
    }
    if (!props.isCustom) {
      props.clear();
    }
  }, [props.isCustom, inserting]);

  // Clear editor state if inserting when cursor is hidden
  useEffect(() => {
    if (cursor.hidden && inserting) props.clear();
  }, [cursor.hidden, inserting]);

  // Sampler information
  const globalInstance = LIVE_AUDIO_INSTANCES.global;
  const [sampler, setSampler] = useState(globalInstance?.sampler);
  const [instanceKey, setInstanceKey] = useState(globalInstance?.key);

  const setGlobalInstrument = (instrumentKey: InstrumentKey) => {
    const instrument = createGlobalInstrument(instrumentKey);
    if (!instrument) return;
    setSampler(instrument.sampler);
    setInstanceKey(instrument.key);
  };

  const setPatternInstrument = (instrumentKey: InstrumentKey) => {
    if (!pattern) return;
    props.updatePattern({
      ...pattern,
      options: { ...pattern.options, instrumentKey },
    });
  };

  // Update global instrument when pattern instrument changes
  useEffect(() => {
    if (!instrumentKey) return;
    setGlobalInstrument(instrumentKey);
  }, [instrumentKey]);

  // Update sampler/key when global instance changes
  useEffect(() => {
    if (!globalInstance) return;
    setSampler(globalInstance.sampler);
    setInstanceKey(globalInstance.key);
  }, [globalInstance]);

  // Function props based on current pattern and cursor
  const onRestClick = () => {
    props.onRestClick(cursor);
  };
  const onEraseClick = () => {
    props.onEraseClick(cursor);
  };
  const onDurationClick = (duration: Duration) => {
    props.onDurationClick(duration, cursor);
  };
  const onTimingClick = (timing: Timing) => {
    props.onTimingClick(timing, cursor);
  };
  const funcProps = {
    onRestClick,
    onEraseClick,
    onDurationClick,
    onTimingClick,
  };

  // Shortcut hook
  usePatternHotkeys({
    ...props,
    cursor,
    onDurationClick,
  });

  return (
    <Editor.Container id="pattern-editor">
      <PatternContextMenu {...cursorProps} {...funcProps} />
      <Editor.Body className="relative">
        <Transition
          show={props.showingPresets}
          appear
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-all ease-in-out duration-300"
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
            title={pattern?.name ?? "Pattern"}
            setTitle={(name) => props.setPatternName(pattern, name)}
            subtitle={props.patternCategory ?? "Category"}
            color={"bg-gradient-to-tr from-emerald-500 to-emerald-600"}
          />

          <Editor.MenuRow show={true} border={true}>
            <PatternControlTab
              {...cursorProps}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
              <PatternTranspositionTab {...cursorProps} />
            )}
            {activeTab === "settings" && (
              <PatternSettingsTab
                {...cursorProps}
                instrument={instanceKey}
                setInstrument={setPatternInstrument}
              />
            )}
          </Editor.MenuRow>

          <Editor.ScoreContainer className={`bg-white/90 mt-2 rounded-lg`}>
            {score}
          </Editor.ScoreContainer>
        </Editor.Content>
      </Editor.Body>
      <PatternPiano {...cursorProps} sampler={sampler} scale={currentScale} />
    </Editor.Container>
  );
}
