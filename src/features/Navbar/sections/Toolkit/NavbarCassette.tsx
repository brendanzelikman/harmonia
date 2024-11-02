import { use, useProjectDispatch } from "types/hooks";
import { GiAudioCassette, GiDrumKit, GiPianoKeys } from "react-icons/gi";
import { setupFileInput } from "providers/idb";
import { selectSelectedTrack } from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import {
  InstrumentCategory,
  MELODIC_CATEGORIES,
  PERCUSSIVE_CATEGORIES,
} from "types/Instrument/InstrumentTypes";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import {
  getCategoryInstruments,
  getInstrumentName,
} from "types/Instrument/InstrumentFunctions";
import {
  createPatternTrack,
  setPatternTrackInstrument,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { useState } from "react";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";

export const NavbarCassette = () => {
  const dispatch = useProjectDispatch();
  const track = use(selectSelectedTrack);
  const renderCategory = (category: InstrumentCategory) => (
    <div
      key={category}
      className={`group/category relative min-h-fit min-w-fit hover:bg-teal-300/80 whitespace-nowrap`}
    >
      <button
        className={`peer size-full bg-teal-800/40 px-3 py-1.5 cursor-pointer hover:bg-slate-950/50 text-sm font-light backdrop-blur-lg hover:text-white`}
      >
        {category}
      </button>
      <div
        className={`font-nunito max-h-96 overflow-scroll text-xs bg-teal-800/50 backdrop-blur border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden peer-hover:block group-hover/category:block`}
      >
        <div className="h-full flex flex-col">
          {getCategoryInstruments(category).map((obj) => (
            <div
              key={obj.key}
              className="py-1 px-1 font-light hover:bg-teal-500/50 cursor-pointer"
            >
              <Listbox.Option
                className={`text-white cursor-pointer select-none p-1 font-light relative`}
                key={obj.key}
                value={obj.key}
                onClick={() =>
                  isPatternTrackId(track?.id)
                    ? dispatch(setPatternTrackInstrument(track?.id, obj.key))
                    : dispatch(
                        createPatternTrack(
                          {
                            parentId: isScaleTrackId(track?.id)
                              ? track.id
                              : undefined,
                          },
                          obj.key
                        )
                      )
                }
              >
                {getInstrumentName(obj.key)}
              </Listbox.Option>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onMouseLeave={() => setIsOpen(false)}
      className="flex relative group/tooltip hover:ring-2 hover:ring-slate-50/80 rounded-full transition-all duration-200"
    >
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="size-9 flex total-center rounded-full bg-gradient-radial from-teal-500/5 to-teal-500/80 cursor-pointer"
      >
        <GiAudioCassette />
      </div>
      <NavbarHoverTooltip
        className="-left-28"
        bgColor="bg-zinc-900"
        padding="px-2 py-1"
        borderColor="border-teal-500 rounded-lg"
      >
        <div className="flex flex-col h-full gap-2 whitespace-nowrap">
          <div className="text-center">
            {isOpen ? "Equipped" : "Equip"} Cassette{" "}
            <span className="font-light text-slate-400">
              ({isOpen ? "Creating" : "Create"} Pattern Track)
            </span>
          </div>
          {isOpen && (
            <div className="flex justify-between gap-4 w-full *:min-w-44">
              <div className="relative items-start grow flex w-full text-xl font-light gap-4">
                <Listbox>
                  {({ open }) => (
                    <div className="relative w-full total-center-col gap-2">
                      <ListboxButton>
                        <div className="total-center-col">
                          <div
                            className={classNames(
                              open
                                ? "bg-gradient-radial from-slate-900/50 via-emerald-900/20 to-sky-800/50"
                                : "",
                              "size-full rounded-full total-center p-4 border"
                            )}
                          >
                            <GiPianoKeys className="size-16" />
                          </div>
                          Melodic
                        </div>
                      </ListboxButton>
                      <ListboxOptions className="z-50 size-full animate-in fade-in slide-in-from-top-4">
                        {MELODIC_CATEGORIES.map(renderCategory)}
                      </ListboxOptions>
                    </div>
                  )}
                </Listbox>
              </div>
              <div className="relative items-start grow flex w-full justify-evenly text-xl font-light gap-4">
                <Listbox>
                  {({ open }) => (
                    <div className="relative w-full total-center-col gap-2">
                      <ListboxButton>
                        <div className="total-center-col">
                          <div
                            className={classNames(
                              open
                                ? "bg-gradient-radial from-slate-900/50 via-emerald-900/20 to-sky-800/50"
                                : "",
                              "size-full rounded-full p-4 total-center border"
                            )}
                          >
                            <GiDrumKit className="size-16" />
                          </div>
                          Percussive
                        </div>
                      </ListboxButton>
                      <ListboxOptions className="animate-in fade-in slide-in-from-top-4">
                        {PERCUSSIVE_CATEGORIES.map(renderCategory)}
                      </ListboxOptions>
                    </div>
                  )}
                </Listbox>
              </div>
              <div
                className="relative items-start grow flex w-full cursor-pointer hover:opacity-80 justify-evenly text-xl font-light gap-4"
                onClick={() => dispatch(setupFileInput(track))}
              >
                <div className="total-center-col">
                  <div className="size-full rounded-full p-4 border">
                    <GiAudioCassette className="size-16" />
                  </div>
                  Sample
                </div>
              </div>
            </div>
          )}
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};
