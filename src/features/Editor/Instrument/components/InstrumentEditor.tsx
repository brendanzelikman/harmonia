import * as Editor from "features/Editor";
import { InstrumentEditorProps } from "..";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { useEffect } from "react";
import useInstrumentHotkeys from "../hooks/useInstrumentHotkeys";
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

  // Close editor if no instrument key
  useEffect(() => {
    if (props.instrumentKey === undefined) {
      props.hideEditor();
    }
  }, [props.instrumentKey]);

  useInstrumentHotkeys({ ...props });

  if (!track) return null;
  const instance = getProperty(LIVE_AUDIO_INSTANCES, track.instrumentId);

  return (
    <Editor.Container>
      <Editor.Body className="relative">
        <Editor.Sidebar className="ease-in-out duration-300">
          <Editor.SidebarHeader className="capitalize">
            Instruments
          </Editor.SidebarHeader>
          <InstrumentList {...props} />
        </Editor.Sidebar>
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
