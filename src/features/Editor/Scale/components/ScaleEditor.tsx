import * as Editor from "features/Editor";
import { Scale, exportScaleToXML, getScaleNotes } from "types/Scale";
import { ScaleEditorProps } from "..";
import useOSMD from "lib/opensheetmusicdisplay";
import { DemoXML } from "assets/demoXML";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { LIVE_AUDIO_INSTANCES, InstrumentKey } from "types/Instrument";
import useScaleHotkeys from "../hooks/useScaleHotkeys";
import { ScaleContextMenu, ScaleList, ScaleControlTab, ScalePiano } from ".";
import { createGlobalInstrument } from "redux/thunks";

export function ScaleEditor(props: ScaleEditorProps) {
  // Score information
  const scale = props.scale as Scale;
  const xml = scale ? exportScaleToXML(scale) : DemoXML;
  const notes = getScaleNotes(scale);
  const { cursor, score } = useOSMD({
    id: "scale-score",
    xml,
    className: "items-center w-full h-full p-4",
    noteCount: notes.length,
  });
  useScaleHotkeys({ ...props, scale, cursor });

  // Sampler information
  const globalInstance = LIVE_AUDIO_INSTANCES.global;
  const [sampler, setSampler] = useState(globalInstance?.sampler);
  const [instrumentKey, setInstrumentKey] = useState(globalInstance?.key);

  const setGlobalInstrument = (instrumentKey: InstrumentKey) => {
    const instrument = createGlobalInstrument(instrumentKey);
    if (!instrument) return;
    setSampler(instrument.sampler);
  };

  // Update global instrument when pattern instrument changes
  useEffect(() => {
    setGlobalInstrument(instrumentKey);
  }, [instrumentKey]);

  // Update sampler/key when global instrument changes
  useEffect(() => {
    if (!globalInstance) return;
    setSampler(globalInstance.sampler);
    setInstrumentKey(globalInstance.key);
  }, [globalInstance]);

  return (
    <Editor.Container id="scale-editor">
      <ScaleContextMenu {...props} />
      <Editor.Body className="relative">
        <Transition
          show={props.showingPresets}
          appear
          enter="transition-opacity ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Editor.Sidebar>
            <Editor.SidebarHeader className="border-b border-b-slate-500/50 mb-2">
              Preset Scales
            </Editor.SidebarHeader>
            <ScaleList {...props} />
          </Editor.Sidebar>
        </Transition>

        <Editor.Content className={`ease-in-out duration-300`}>
          <Editor.Title
            title={props.scaleName}
            subtitle={props.scaleCategory}
            color={"bg-gradient-to-tr from-sky-500 to-sky-600"}
          />
          <Editor.MenuRow show={true} border={false}>
            <ScaleControlTab
              {...props}
              instrument={instrumentKey}
              setInstrument={setInstrumentKey}
            />
          </Editor.MenuRow>

          <Editor.ScoreContainer className={`bg-white/90 mt-2 rounded-xl`}>
            {score}
          </Editor.ScoreContainer>
        </Editor.Content>
      </Editor.Body>
      <ScalePiano {...props} sampler={sampler} />
    </Editor.Container>
  );
}
