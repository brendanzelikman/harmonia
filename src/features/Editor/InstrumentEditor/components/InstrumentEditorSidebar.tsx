import { InstrumentEditorProps } from "../InstrumentEditor";
import { Disclosure, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ComponentProps, useCallback, useMemo, useState } from "react";
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
import {
  EditorList,
  EditorListItem,
} from "features/Editor/components/EditorList";
import {
  EditorSidebar,
  EditorSidebarHeader,
} from "features/Editor/components/EditorSidebar";
import {
  getInstrumentCategory,
  getCategoryInstruments,
} from "types/Instrument/InstrumentFunctions";
import {
  CategorizedInstrument,
  InstrumentCategory,
  INSTRUMENT_CATEGORIES,
  MELODIC_CATEGORIES,
  PERCUSSIVE_CATEGORIES,
} from "types/Instrument/InstrumentTypes";
import { useHotkeys } from "react-hotkeys-hook";
import classNames from "classnames";

export function InstrumentEditorSidebar(props: InstrumentEditorProps) {
  const { instrument } = props;
  const instrumentCategory = getInstrumentCategory(instrument?.key);

  /** Render an instrument */
  const renderInstrument = useCallback(
    (i: CategorizedInstrument) => (
      <EditorListItem
        key={i.key}
        className={`select-none ${
          instrument?.key === i.key
            ? "font-semibold text-orange-500 border-l border-l-orange-500"
            : "text-slate-400 border-l border-l-slate-500/80 hover:border-l-slate-300"
        }`}
        onClick={() => props.setInstrument(i.key)}
      >
        {i.name}
      </EditorListItem>
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

  const FilterButton = (
    props: ComponentProps<"button"> & { active?: boolean }
  ) => {
    return (
      <button
        {...props}
        className={classNames(
          props.className,
          props.active ? "border-orange-400" : "border-slate-400",
          "p-2 py-1 border active:bg-orange-100/10 rounded-lg mb-2"
        )}
      />
    );
  };

  const [filter, setFilter] = useState<"melodic" | "percussive" | undefined>();
  const availableCategories = useMemo(
    () =>
      INSTRUMENT_CATEGORIES.filter((category) => {
        if (filter === "melodic") {
          return MELODIC_CATEGORIES.includes(category);
        }
        if (filter === "percussive") {
          return PERCUSSIVE_CATEGORIES.includes(category);
        }
        return true;
      }),
    [filter]
  );

  return (
    <EditorSidebar className="ease-in-out duration-300">
      <EditorSidebarHeader className="capitalize">
        Preset Instruments
      </EditorSidebarHeader>
      <EditorList className="p-2">
        <div className="flex total-center *:min-w-12 w-full gap-2">
          <FilterButton
            active={filter === undefined}
            onClick={() => setFilter(undefined)}
          >
            All
          </FilterButton>
          <FilterButton
            active={filter === "melodic"}
            onClick={() => setFilter("melodic")}
          >
            Melodic
          </FilterButton>
          <FilterButton
            active={filter === "percussive"}
            onClick={() => setFilter("percussive")}
          >
            Percussive
          </FilterButton>
        </div>
        {availableCategories.map((category) => (
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
      </EditorList>
    </EditorSidebar>
  );
}
