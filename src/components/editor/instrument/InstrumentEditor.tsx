import * as Editor from "../Editor";
import TrackEffects from "./Effects";
import EditorPiano from "../Piano";
import { Transition } from "@headlessui/react";
import { InstrumentEditorProps } from ".";
import { InstrumentCategory, getSampler } from "types/instrument";

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
import useInstrumentShortcuts from "./useInstrumentShortcuts";
import InstrumentList from "./InstrumentList";

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

export function EditorInstrument(props: InstrumentEditorProps) {
  const { instrumentCategory } = props;
  const track = props.track as PatternTrack;

  // Sampler information
  const [trackSampler, setTrackSampler] = useState<null | Sampler>(null);
  useEffect(() => {
    setTimeout(() => {
      const sampler = getSampler(track?.id);
      setTrackSampler(sampler);
    }, 100);
  }, [track.instrument, track.id]);

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
          className={`px-8 py-2 flex flex-col ease-in-out duration-300`}
        >
          <Editor.Title
            className="capitalize"
            title={props.instrumentName}
            subtitle={props.instrumentCategory}
            color="bg-orange-500/80"
          />
          <Editor.ScoreContainer className="border flex-grow border-slate-600">
            <img
              className="w-full object-cover"
              src={getInstrumentIcon(instrumentCategory)}
            />
          </Editor.ScoreContainer>
          <Editor.EffectMenu className="flex mt-auto pt-6 w-full items-center">
            {track ? <TrackEffects track={track} /> : null}
          </Editor.EffectMenu>
        </Editor.Content>
      </Editor.Body>
      <EditorPiano
        sampler={trackSampler}
        className={`piano-${track?.instrument}`}
      />
    </Editor.Container>
  );
}
