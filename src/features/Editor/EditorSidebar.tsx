import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  GiBagpipes,
  GiBassoon,
  GiCat,
  GiCaveman,
  GiClarinet,
  GiDrum,
  GiDrumKit,
  GiFlute,
  GiGuitarBassHead,
  GiGuitarHead,
  GiHarp,
  GiKeyboard,
  GiMetalBar,
  GiMusicalKeyboard,
  GiMusicalNotes,
  GiPianoKeys,
  GiPig,
  GiPipeOrgan,
  GiRingingBell,
  GiSaxophone,
  GiSing,
  GiSoundOn,
  GiSoundWaves,
  GiTriangleTarget,
  GiTrombone,
  GiTrumpet,
  GiTuba,
  GiViolin,
  GiWoodBeam,
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
  InstrumentId,
  INSTRUMENT_CATEGORIES_BY_KEY,
  InstrumentCategory,
  CategorizedInstrument,
  InstrumentCategoryType,
  instrumentCategoryTypeMap,
  instrumentCategories,
  InstrumentKey,
  INSTRUMENT_CATEGORY_TYPES_BY_KEY,
} from "types/Instrument/InstrumentTypes";
import { useAppDispatch } from "hooks/useRedux";
import { updateInstrument } from "types/Instrument/InstrumentSlice";
import { getSampleKeys } from "app/samples";

type InstrumentEditorSidebarProps = {
  id: InstrumentId;
  instrumentKey: InstrumentKey;
};

export function InstrumentEditorSidebar(props: InstrumentEditorSidebarProps) {
  const { id, instrumentKey } = props;
  const dispatch = useAppDispatch();
  const category = INSTRUMENT_CATEGORIES_BY_KEY[instrumentKey];
  const categoryType = INSTRUMENT_CATEGORY_TYPES_BY_KEY[instrumentKey];

  // The categories can be filtered
  const [filter, setFilter] = useState<InstrumentCategoryType>(categoryType);
  const _categories = useMemo(() => {
    if (!filter) return INSTRUMENT_CATEGORIES;
    return instrumentCategoryTypeMap[filter];
  }, [filter]);

  const categories: InstrumentCategory[] = useMemo(() => {
    return [..._categories];
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
        data-selected={instrumentKey === i.key}
        className="select-none border-l border-l-slate-500/80 text-slate-400 hover:border-l-slate300 data-[selected=true]:border-l-orange-500 data-[selected=true]:text-orange-500 data-[selected=true]:font-semibold mx-2 p-2 font-light cursor-pointer"
        onClick={() =>
          dispatch(updateInstrument({ data: { id, update: { key: i.key } } }))
        }
      >
        {i.name}
      </div>
    ),
    [instrumentKey]
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
                  {InstrumentIconMap[c] ?? InstrumentIconMap[filter] ?? (
                    <GiDrum />
                  )}
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
    [category, samples, filter, renderInstrument]
  );

  return (
    <EditorSidebar>
      <EditorSidebarHeader>Instruments</EditorSidebarHeader>
      <EditorSidebarList>
        <div className="flex *:min-w-12 mb-2 flex-wrap max-w-72 w-full gap-2">
          {instrumentCategories.map((category) => (
            <button
              key={category}
              data-active={filter === category}
              className="p-2 h-8 capitalize cursor-pointer py-1 border active:bg-orange-100/10 rounded-lg border-slate-400 data-[active=true]:border-orange-400"
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {categories.map(renderCategory)}
      </EditorSidebarList>
    </EditorSidebar>
  );
}

export const InstrumentIconMap: {
  [key in InstrumentCategoryType | InstrumentCategory]?: ReactNode;
} = {
  keyboards: <GiPianoKeys />,
  strings: <GiViolin />,
  woodwinds: <GiClarinet />,
  brass: <GiTrumpet />,
  mallets: <GiXylophone />,
  percussion: <GiDrum />,
  drumkits: <GiDrum />,
  loops: <GiDrumKit />,
  sounds: <GiSoundWaves />,
  // Keyboards
  "Grand Piano": <GiPianoKeys />,
  "Electric Piano": <GiMusicalKeyboard />,
  Organ: <GiPipeOrgan />,
  "Caveman Synths": <GiMusicalKeyboard />,
  // Strings
  Violin: <GiViolin />,
  Harp: <GiHarp />,
  Tuba: <GiTuba />,
  Guitar: <GiGuitarHead />,
  "Bass Guitar": <GiGuitarBassHead />,
  // Woodwinds
  Piccolo: <GiFlute />,
  Flute: <GiFlute />,
  Clarinet: <GiClarinet />,
  Bassoon: <GiBassoon />,
  // Brass
  Trombone: <GiTrombone />,
  Bagpipes: <GiBagpipes />,
  Trumpet: <GiTrumpet />,
  Saxophone: <GiSaxophone />,
  // Mallets
  Triangle: <GiTriangleTarget />,
  Bells: <GiRingingBell />,
  Wood: <GiWoodBeam />,
  Metal: <GiMetalBar />,
  // Sounds
  "Death Metal Vocals": <GiSing />,
  "Animal Sounds": <GiPig />,
  "Sound Effects": <GiMusicalNotes />,
};
