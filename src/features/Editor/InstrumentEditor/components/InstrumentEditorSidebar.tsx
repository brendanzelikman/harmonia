import {
  INSTRUMENT_CATEGORIES,
  InstrumentCategory,
  CategorizedInstrument,
  getCategoryInstruments,
  getInstrumentCategory,
} from "types/Instrument";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { Editor } from "features/Editor/components";
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

export function InstrumentEditorSidebar(props: InstrumentEditorProps) {
  const { instrument } = props;
  const instrumentCategory = getInstrumentCategory(instrument?.key);

  /** Render an instrument */
  const renderInstrument = useCallback(
    (i: CategorizedInstrument) => (
      <Editor.ListItem
        key={i.key}
        className={`select-none ${
          instrument?.key === i.key
            ? "font-semibold text-orange-500 border-l border-l-orange-500"
            : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
        }`}
        onClick={() => props.setInstrument(i.key)}
      >
        {i.name}
      </Editor.ListItem>
    ),
    [props.setInstrument, instrument?.key]
  );

  /** Each instrument has a corresponding icon for its category */
  const Icon = (props: { category: InstrumentCategory }) => {
    const { category } = props;
    if (category === "Keyboards") return <GiPianoKeys />;
    if (category === "Guitars") return <GiGuitar />;
    if (category === "Strings") return <GiViolin />;
    if (category === "Woodwinds") return <GiClarinet />;
    if (category === "Brass") return <GiTrumpet />;
    if (category === "Mallets") return <GiXylophone />;
    if (category === "Death Metal Vocals") return <GiSing />;
    return <GiDrum />;
  };

  return (
    <Editor.Sidebar className="ease-in-out duration-300">
      <Editor.SidebarHeader className="capitalize">
        Preset Instruments
      </Editor.SidebarHeader>
      <Editor.List className="p-2">
        {INSTRUMENT_CATEGORIES.map((category) => (
          <Disclosure key={category}>
            {({ open }) => (
              <>
                <Disclosure.Button className="outline-none">
                  <div className="flex items-center justify-center">
                    <label
                      className={`capitalize py-2.5 px-2 ${
                        category === instrumentCategory
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
    </Editor.Sidebar>
  );
}
