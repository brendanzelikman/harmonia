import * as Editor from "features/editor";
import Scales, { Scale } from "types/scale";
import { ScaleEditorProps } from "..";
import useOSMD from "lib/opensheetmusicdisplay";
import { DemoXML } from "assets/demoXML";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import {
  INSTRUMENTS,
  InstrumentKey,
  createGlobalInstrument,
} from "types/instrument";
import useScaleShortcuts from "../hooks/useScaleShortcuts";
import { ScaleContextMenu, ScaleList, ScaleControlTab, ScalePiano } from ".";

export function ScaleEditor(props: ScaleEditorProps) {
  // Score information
  const scale = props.scale as Scale;
  const xml = scale ? Scales.exportToXML(scale) : DemoXML;
  const { cursor, score } = useOSMD({
    id: "scale-score",
    xml,
    className: "items-center w-full h-full p-4",
    noteCount: scale?.notes.length ?? 0,
  });
  useScaleShortcuts({ ...props, scale, cursor });

  // Sampler information
  const globalInstrument = INSTRUMENTS["global"];
  const [sampler, setSampler] = useState(globalInstrument?.sampler);
  const [instrumentKey, setInstrumentKey] = useState(globalInstrument?.key);

  const setGlobalInstrument = async (instrumentKey: InstrumentKey) => {
    const instrument = await createGlobalInstrument(instrumentKey);
    if (!instrument) return;
    const { sampler } = instrument;
    setSampler(sampler);
  };

  // Update global instrument when pattern instrument changes
  useEffect(() => {
    setGlobalInstrument(instrumentKey);
  }, [instrumentKey]);

  // Update sampler/key when global instrument changes
  useEffect(() => {
    if (!globalInstrument) return;
    setSampler(globalInstrument.sampler);
    setInstrumentKey(globalInstrument.key);
  }, [globalInstrument]);

  return (
    <Editor.Container id="scale-editor">
      <ScaleContextMenu {...props} />
      <Editor.Body className="relative">
        <Transition
          show={props.showingPresets}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
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
