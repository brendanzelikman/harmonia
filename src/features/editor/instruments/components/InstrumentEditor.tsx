import * as Editor from "features/editor";
import { Transition } from "@headlessui/react";
import { InstrumentEditorProps } from "..";
import { InstrumentCategory, getLiveSampler } from "types/instrument";

import KeyboardsIcon from "assets/instruments/keyboards.jpg";
import GuitarsIcon from "assets/instruments/guitars.jpg";
import StringsIcon from "assets/instruments/strings.jpg";
import BrassIcon from "assets/instruments/brass.jpg";
import WoodwindsIcon from "assets/instruments/woodwinds.jpg";
import MalletsIcon from "assets/instruments/mallets.jpg";
import PercussionIcon from "assets/instruments/percussion.jpg";

import { PatternTrack } from "types/tracks";
import { useEffect, useState } from "react";
import { Sampler } from "tone";
import useInstrumentShortcuts from "../hooks/useInstrumentShortcuts";
import { InstrumentEffects, InstrumentList, InstrumentPiano } from ".";
import { InstrumentEffectBar } from "./InstrumentEffectBar";

export function EditorInstrument(props: InstrumentEditorProps) {
  const { instrumentKey, instrumentCategory } = props;

  const track = props.track as PatternTrack;

  // Sampler information
  const [sampler, setSampler] = useState<null | Sampler>(null);
  useEffect(() => {
    setTimeout(() => {
      const sampler = getLiveSampler(track?.id);
      setSampler(sampler);
    }, 100);
  }, [track?.instrument, track?.id]);

  // Close editor if no instrument key
  useEffect(() => {
    if (instrumentKey === undefined) {
      props.hideEditor();
    }
  }, [instrumentKey]);

  useInstrumentShortcuts({ ...props });

  return (
    <Editor.Container>
      <Editor.Body className="relative">
        <Transition
          show={props.showingPresets}
          enter="transition ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in-out duration-300"
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
        <Editor.Content
          className={`relative px-8 py-2 flex flex-col ease-in-out duration-300`}
        >
          <Editor.Title
            className="capitalize"
            title={props.instrumentName}
            subtitle={props.instrumentCategory}
            color="bg-gradient-to-tr from-orange-400 to-orange-500"
          />
          <InstrumentEffectBar {...props} />
          <Editor.ScoreContainer className="border flex-grow border-slate-700 rounded aspect-w-16 aspect-h-3">
            <img
              className="w-full object-cover"
              src={getInstrumentIcon(instrumentCategory)}
            />
          </Editor.ScoreContainer>

          <InstrumentEffects {...props} />
        </Editor.Content>
      </Editor.Body>
      <InstrumentPiano {...props} sampler={sampler} />
    </Editor.Container>
  );
}

const getInstrumentIcon = (category: InstrumentCategory) => {
  switch (category) {
    case "keyboards":
      return KeyboardsIcon;
    case "guitars":
      return GuitarsIcon;
    case "strings":
      return StringsIcon;
    case "brass":
      return BrassIcon;
    case "woodwinds":
      return WoodwindsIcon;
    case "mallets":
      return MalletsIcon;
    case "percussion":
      return PercussionIcon;
    default:
      return "";
  }
};
