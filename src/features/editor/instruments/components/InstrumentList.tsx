import {
  INSTRUMENT_CATEGORIES,
  InstrumentCategory,
  getCategoryInstruments,
} from "types/instrument";
import { InstrumentEditorProps } from "..";
import * as Editor from "features/editor";
import { Disclosure, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useCallback } from "react";
import {
  GiClarinet,
  GiDrum,
  GiGuitar,
  GiPianoKeys,
  GiSing,
  GiTrumpet,
  GiViolin,
  GiXylophone,
} from "react-icons/gi";

export function InstrumentList(props: InstrumentEditorProps) {
  const renderInstrument = useCallback(
    (instrument: any) => (
      <Editor.ListItem
        key={instrument.key}
        className={`select-none ${
          props.track?.instrument === instrument.key
            ? "font-semibold text-orange-500 border-l border-l-orange-500"
            : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
        }`}
        onClick={() =>
          !!props.track
            ? props.setTrackInstrument(props.track.id, instrument.key)
            : null
        }
      >
        {instrument.name}
      </Editor.ListItem>
    ),
    [props.track]
  );

  const Icon = (props: { category: InstrumentCategory }) => {
    const { category } = props;
    if (category === "keyboards") return <GiPianoKeys />;
    if (category === "guitars") return <GiGuitar />;
    if (category === "strings") return <GiViolin />;
    if (category === "woodwinds") return <GiClarinet />;
    if (category === "brass") return <GiTrumpet />;
    if (category === "mallets") return <GiXylophone />;
    if (category === "vocals") return <GiSing />;
    return <GiDrum />;
  };

  return (
    <Editor.List className="p-2">
      {INSTRUMENT_CATEGORIES.map((category) => (
        <Disclosure key={category}>
          {({ open }) => (
            <>
              <Disclosure.Button className="outline-none">
                <div className="flex items-center justify-center">
                  <label
                    className={`capitalize py-2.5 px-2 ${
                      category === props.instrumentCategory
                        ? "text-orange-400"
                        : "text-slate-50"
                    } flex items-center select-none`}
                  >
                    <Icon category={category} />
                    <span className={`ml-3`}>{category}</span>
                  </label>
                  <span className="ml-auto mr-2">
                    {open ? <BsChevronDown /> : <BsChevronUp />}
                  </span>
                </div>
              </Disclosure.Button>
              <Transition
                show={open}
                appear
                enter="transition-all ease-in-out duration-150"
                enterFrom="opacity-0 transform scale-95"
                enterTo="opacity-100 transform scale-100"
                leave="transition-all ease-in-out duration-150"
                leaveFrom="opacity-100 transform scale-100"
                leaveTo="opacity-0 transform scale-95"
              >
                <Disclosure.Panel>
                  {getCategoryInstruments(category).map(renderInstrument)}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      ))}
    </Editor.List>
  );
}
