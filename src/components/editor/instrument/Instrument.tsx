import * as Editor from "../Editor";
import TrackEffects from "./Effects";
import EditorPiano from "../Piano";
import { Disclosure } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import useEventListeners from "hooks/useEventListeners";
import { EditorInstrumentProps } from ".";
import {
  getInstrumentName,
  InstrumentCategory,
  InstrumentName,
  INSTRUMENT_CATEGORIES,
} from "types/instrument";

import categories from "assets/instruments/categories.json";
import KeyboardsIcon from "assets/instruments/keyboards.jpg";
import GuitarsIcon from "assets/instruments/guitars.jpg";
import StringsIcon from "assets/instruments/strings.jpg";
import BrassIcon from "assets/instruments/brass.jpg";
import WoodwindsIcon from "assets/instruments/woodwinds.jpg";
import MalletsIcon from "assets/instruments/mallets.jpg";
import PercussionIcon from "assets/instruments/percussion.jpg";

import { PatternTrack, Track } from "types/tracks";
import useEditorData from "../hooks/useEditorData";

interface InstrumentType {
  key: InstrumentName;
  name: string;
}

const getCategoryInstruments = (category: InstrumentCategory) =>
  categories[category] as InstrumentType[];

const getInstrumentCategory = (instrument: string) => {
  for (const category of INSTRUMENT_CATEGORIES) {
    const instruments = getCategoryInstruments(category);
    if (instruments.some(({ key }) => key === instrument)) {
      return category;
    }
  }
  return "keyboards";
};

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

export function EditorInstrument(props: EditorInstrumentProps) {
  const { setTrackInstrument } = props;
  const track = useEditorData<Track>(props.track) as PatternTrack;

  const typedInstrument = track?.instrument as InstrumentName;
  const typedCategory = getInstrumentCategory(typedInstrument);

  const allInstruments = Object.keys(categories).reduce(
    (acc, category) => [
      ...acc,
      ...getCategoryInstruments(category as InstrumentCategory),
    ],
    [] as InstrumentType[]
  );

  useEventListeners(
    {
      ArrowLeft: {
        keydown: () => {
          if (!track) return;
          const index = allInstruments.findIndex(
            ({ key }) => key === typedInstrument
          );
          const prevInstrument =
            allInstruments[index - 1] || allInstruments.at(-1);
          if (prevInstrument) {
            setTrackInstrument(track.id, prevInstrument.key);
          }
        },
      },
      ArrowRight: {
        keydown: () => {
          if (!track) return;
          const index = allInstruments.findIndex(
            ({ key }) => key === typedInstrument
          );
          const nextInstrument = allInstruments[index + 1] || allInstruments[0];
          if (nextInstrument) {
            setTrackInstrument(track.id, nextInstrument.key);
          }
        },
      },
      ArrowUp: {
        keydown: () => {
          if (!track) return;
          const index = INSTRUMENT_CATEGORIES.findIndex(
            (category) => category === typedCategory
          );
          const prevCategory =
            INSTRUMENT_CATEGORIES[index - 1] || INSTRUMENT_CATEGORIES.at(-1);
          if (prevCategory) {
            const prevInstrument = getCategoryInstruments(prevCategory)[0];
            setTrackInstrument(track.id, prevInstrument.key);
          }
        },
      },
      ArrowDown: {
        keydown: () => {
          if (!track) return;
          const index = INSTRUMENT_CATEGORIES.findIndex(
            (category) => category === typedCategory
          );
          const nextCategory =
            INSTRUMENT_CATEGORIES[index + 1] || INSTRUMENT_CATEGORIES[0];
          if (nextCategory) {
            const nextInstrument = getCategoryInstruments(nextCategory)[0];
            setTrackInstrument(track.id, nextInstrument.key);
          }
        },
      },
    },
    [track, typedInstrument, allInstruments]
  );

  return (
    <Editor.Container>
      <Editor.Body>
        <Editor.Sidebar>
          <Editor.CardHeader className="capitalize">
            Instrument Types
          </Editor.CardHeader>
          <Editor.List>
            {INSTRUMENT_CATEGORIES.map((category) => (
              <Disclosure key={category}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="outline-none">
                      <div className="flex items-center justify-center text-slate-50">
                        <label
                          className={`capitalize font-nunito py-3 px-2 ${
                            open ? "font-extrabold" : "font-medium"
                          } select-none`}
                        >
                          {category}
                        </label>
                        <span className="ml-auto mr-2">
                          {open ? <BsChevronDown /> : <BsChevronUp />}
                        </span>
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      {getCategoryInstruments(category).map((instrument) => (
                        <Editor.ListItem
                          key={instrument.key}
                          className={`select-none ${
                            props.track?.instrument === instrument.key
                              ? "font-semibold text-orange-500 border-l border-l-orange-500"
                              : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
                          }`}
                          onClick={() =>
                            track
                              ? setTrackInstrument(track.id, instrument.key)
                              : null
                          }
                        >
                          {instrument.name}
                        </Editor.ListItem>
                      ))}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </Editor.List>
        </Editor.Sidebar>
        <Editor.Content>
          <Editor.Title
            className="capitalize"
            title={
              getInstrumentName(typedInstrument) ??
              track?.instrument ??
              "Grand Piano"
            }
            subtitle={getInstrumentCategory(typedInstrument)}
            color="bg-orange-500/80"
          />
          <Editor.ScoreContainer className="border flex-grow border-slate-600">
            <img className="w-full" src={getInstrumentIcon(typedCategory)} />
          </Editor.ScoreContainer>
          <Editor.Menu className="flex mt-auto pt-6">
            {track ? <TrackEffects track={track} /> : null}
          </Editor.Menu>
        </Editor.Content>
      </Editor.Body>
      <EditorPiano track={track} className={`piano-${track?.instrument}`} />
    </Editor.Container>
  );
}
