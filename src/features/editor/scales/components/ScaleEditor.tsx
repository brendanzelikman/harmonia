import * as Editor from "features/editor";
import Scales, { Scale } from "types/scale";
import { ScaleEditorProps } from "..";
import useOSMD from "lib/opensheetmusicdisplay";
import { DemoXML } from "assets/demo";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { getGlobalInstrumentName, getGlobalSampler } from "types/instrument";
import useScaleShortcuts from "../hooks/useScaleShortcuts";
import { ScaleContextMenu, ScaleList, ScaleControlTab, ScalePiano } from ".";

export function ScaleEditor(props: ScaleEditorProps) {
  // Score information
  const scale = props.scale as Scale;
  const xml = scale ? Scales.exportToXML(scale?.notes ?? []) : DemoXML;
  const { cursor, score } = useOSMD({
    id: "scale-score",
    xml,
    className: "items-center w-full h-full p-4",
    noteCount: scale?.notes.length ?? 0,
  });
  useScaleShortcuts({ ...props, scale, cursor });

  // Sampler information
  const [sampler, setSampler] = useState(getGlobalSampler());
  const [instrument, setInstrument] = useState(getGlobalInstrumentName() || "");
  useEffect(() => {
    setTimeout(() => setSampler(getGlobalSampler()), 100);
  }, [instrument]);

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
            <ScaleControlTab {...props} setInstrument={setInstrument} />
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
