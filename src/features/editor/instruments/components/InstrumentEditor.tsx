import * as Editor from "features/editor";
import { Transition } from "@headlessui/react";
import { InstrumentEditorProps } from "..";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { useEffect } from "react";
import useInstrumentShortcuts from "../hooks/useInstrumentShortcuts";
import {
  InstrumentAnalyser,
  InstrumentEffects,
  InstrumentList,
  InstrumentPiano,
} from ".";
import { InstrumentEffectBar } from "./InstrumentEffectBar";
import { PatternTrack } from "types/PatternTrack";
import { getProperty } from "types/util";

export function EditorInstrument(props: InstrumentEditorProps) {
  const track = props.track as PatternTrack;
  const instance = getProperty(LIVE_AUDIO_INSTANCES, track.instrumentId);

  // Close editor if no instrument key
  useEffect(() => {
    if (props.instrumentKey === undefined) {
      props.hideEditor();
    }
  }, [props.instrumentKey]);

  useInstrumentShortcuts({ ...props });

  return (
    <Editor.Container>
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
          <Editor.Sidebar className="ease-in-out duration-300">
            <Editor.SidebarHeader className="capitalize">
              Instruments
            </Editor.SidebarHeader>
            <InstrumentList {...props} />
          </Editor.Sidebar>
        </Transition>
        <Editor.Content>
          <Editor.Title
            className="capitalize"
            title={props.instrumentName}
            subtitle={props.instrumentCategory}
            color="bg-gradient-to-tr from-orange-400 to-orange-500"
          />
          <div className="flex flex-col overflow-scroll">
            <InstrumentEffectBar {...props} />
            <InstrumentAnalyser
              track={track}
              type="waveform"
              render={!props.isTransportStarted}
            />
            <InstrumentAnalyser
              track={track}
              type="fft"
              render={!props.isTransportStarted}
            />

            <InstrumentEffects {...props} />
          </div>
        </Editor.Content>
      </Editor.Body>
      <InstrumentPiano {...props} sampler={instance?.sampler} />
    </Editor.Container>
  );
}
