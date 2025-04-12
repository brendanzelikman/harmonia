import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  GiCat,
  GiClarinet,
  GiDrum,
  GiGuitar,
  GiPianoKeys,
  GiSing,
  GiSoundWaves,
  GiTrumpet,
  GiViolin,
  GiXylophone,
} from "react-icons/gi";
import {
  EditorSidebarHeader,
  EditorSidebarList,
} from "features/Editor/EditorContent";
import { EditorSidebar } from "features/Editor/EditorContent";
import {
  getCategoryInstruments,
  getInstrumentName,
} from "types/Instrument/InstrumentFunctions";
import {
  INSTRUMENT_CATEGORIES,
  MELODIC_CATEGORIES,
  PERCUSSIVE_CATEGORIES,
  InstrumentId,
  INSTRUMENT_CATEGORIES_BY_KEY,
  InstrumentCategory,
  CategorizedInstrument,
} from "types/Instrument/InstrumentTypes";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { selectInstrumentKey } from "types/Instrument/InstrumentSelectors";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import { getSampleKeys } from "app/samples";

type InstrumentEditorSidebarProps = { id: InstrumentId };

export function InstrumentEditorSidebar(props: InstrumentEditorSidebarProps) {
  const { id } = props;
  const dispatch = useAppDispatch();
  const trackId = useAppValue(selectSelectedTrackId);
  const key = useAppValue((_) => selectInstrumentKey(_, props.id));
  const category = key ? INSTRUMENT_CATEGORIES_BY_KEY[key] : undefined;

  // The categories can be filtered
  const [filter, setFilter] = useState<"melodic" | "percussive" | undefined>();
  const _categories = useMemo(() => {
    if (!filter) return INSTRUMENT_CATEGORIES;
    return filter === "melodic" ? MELODIC_CATEGORIES : PERCUSSIVE_CATEGORIES;
  }, [filter]);
  const categories: InstrumentCategory[] = useMemo(() => {
    return [..._categories, "Samples"];
  }, [_categories]);

  const [samples, setSamples] = useState<CategorizedInstrument[]>([]);
  useEffect(() => {
    const fetchSamples = async () => {
      const keys = await getSampleKeys();
      const data = keys.map((key) => ({ key, name: getInstrumentName(key) }));
      setSamples(data);
    };
    fetchSamples();
  }, []);

  const renderInstrument = useCallback(
    (i: CategorizedInstrument) => (
      <div
        key={i.key}
        data-selected={key === i.key}
        className="select-none border-l border-l-slate-500/80 text-slate-400 hover:border-l-slate300 data-[selected=true]:border-l-orange-500 data-[selected=true]:text-orange-500 data-[selected=true]:font-semibold mx-2 p-2 font-light cursor-pointer"
        onClick={() =>
          dispatch(updateInstrument({ data: { id, update: { key: i.key } } }))
        }
      >
        {i.name}
      </div>
    ),
    [key, trackId]
  );

  const renderCategory = useCallback(
    (c: InstrumentCategory) => {
      const instruments = c === "Samples" ? samples : getCategoryInstruments(c);
      return (
        <Disclosure key={c} as="div" className="w-full">
          {({ open }) => (
            <>
              <DisclosureButton className="total-center w-full outline-none">
                <div
                  data-selected={category === c}
                  className="capitalize px-2 py-2.5 gap-4 flex items-center select-none text-slate-50 data-[selected=true]:text-orange-400"
                >
                  {IconMap[c] ?? <GiDrum />}
                  {c}
                </div>
                {open ? (
                  <BsChevronDown className="ml-auto" />
                ) : (
                  <BsChevronUp className="ml-auto" />
                )}
              </DisclosureButton>
              <DisclosurePanel className="animate-in fade-in">
                {instruments.map(renderInstrument)}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      );
    },
    [category, samples, renderInstrument]
  );

  return (
    <EditorSidebar>
      <EditorSidebarHeader>Instruments</EditorSidebarHeader>
      <EditorSidebarList>
        <div className="flex total-center *:min-w-12 w-full gap-2">
          <button
            data-active={filter === undefined}
            className="p-2 py-1 border active:bg-orange-100/10 rounded-lg mb-2 border-slate-400 data-[active=true]:border-orange-400"
            onClick={() => setFilter(undefined)}
          >
            All
          </button>
          <button
            data-active={filter === "melodic"}
            className="p-2 py-1 border active:bg-orange-100/10 rounded-lg mb-2 border-slate-400 data-[active=true]:border-orange-400"
            onClick={() => setFilter("melodic")}
          >
            Melodic
          </button>
          <button
            data-active={filter === "percussive"}
            className="p-2 py-1 border active:bg-orange-100/10 rounded-lg mb-2 border-slate-400 data-[active=true]:border-orange-400"
            onClick={() => setFilter("percussive")}
          >
            Percussive
          </button>
        </div>
        {categories.map(renderCategory)}
      </EditorSidebarList>
    </EditorSidebar>
  );
}

const IconMap: Record<string, ReactNode> = {
  Keyboards: <GiPianoKeys />,
  Guitars: <GiGuitar />,
  Strings: <GiViolin />,
  Woodwinds: <GiClarinet />,
  Brass: <GiTrumpet />,
  Mallets: <GiXylophone />,
  "Death Metal Vocals": <GiSing />,
  "Animal Sounds": <GiCat />,
  Samples: <GiSoundWaves />,
};
