import { use, useProjectDispatch } from "types/hooks";
import { GiAudioCassette, GiDrumKit, GiPianoKeys } from "react-icons/gi";
import { setupFileInput } from "providers/idb";
import { selectSelectedPatternTrack } from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import {
  InstrumentCategory,
  MELODIC_CATEGORIES,
  PERCUSSIVE_CATEGORIES,
} from "types/Instrument/InstrumentTypes";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { Listbox } from "@headlessui/react";
import {
  getCategoryInstruments,
  getInstrumentName,
} from "types/Instrument/InstrumentFunctions";
import {
  createPatternTrack,
  setPatternTrackInstrument,
} from "types/Track/PatternTrack/PatternTrackThunks";

export const NavbarCassette = () => {
  const dispatch = useProjectDispatch();
  const track = use(selectSelectedPatternTrack);

  const renderCategory = (category: InstrumentCategory) => (
    <div
      key={category}
      className={`group/category relative min-h-fit min-w-fit hover:bg-teal-300/80 whitespace-nowrap`}
    >
      <div
        className={`peer px-3 py-1.5 cursor-pointer hover:bg-slate-950/50 text-sm font-light backdrop-blur bg-slate-800 hover:text-white`}
      >
        {category}
      </div>
      <div
        className={`font-nunito max-h-96 overflow-scroll text-xs bg-slate-800 border border-white/50 rounded top-0 right-0 translate-x-[100%] absolute hidden peer-hover:block group-hover/category:block`}
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
                  track
                    ? dispatch(setPatternTrackInstrument(track?.id, obj.key))
                    : dispatch(createPatternTrack(undefined, obj.key))
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

  return (
    <div className="flex relative group/tooltip hover:ring-2 hover:ring-slate-50/80 rounded-full transition-all duration-200">
      <div className="size-9 flex total-center rounded-full bg-gradient-radial from-teal-600/5 to-teal-600/80 cursor-pointer">
        <GiAudioCassette />
      </div>
      <NavbarHoverTooltip className="-left-44">
        <div className="flex flex-col h-full gap-2">
          <div className="flex items-center gap-2 w-full">
            <Listbox value={null}>
              {(props) => (
                <div className="relative">
                  <div className="flex gap-2 total-center">
                    <Listbox.Button
                      className={classNames(
                        "px-2 py-1 size-full total-center whitespace-nowrap rounded border hover:opacity-75 border-teal-500/80",
                        props.open && "bg-teal-500/80"
                      )}
                    >
                      Select Virtual Instrument
                    </Listbox.Button>
                    <div
                      className="px-2 py-1 w-min whitespace-nowrap cursor-pointer hover:opacity-75 select-none rounded border border-yellow-500/80"
                      onClick={() => dispatch(setupFileInput(track))}
                    >
                      Load Custom Sample
                    </div>
                  </div>
                  <Listbox.Options className="mt-4 flex size-full">
                    <div className="relative items-start grow flex w-full justify-evenly text-xl font-light gap-4">
                      <Listbox>
                        {({ open }) => (
                          <div className="relative w-full flex flex-col gap-2 total-center">
                            <Listbox.Button>
                              <div className="flex flex-col total-center">
                                <div
                                  className={classNames(
                                    open
                                      ? "bg-gradient-radial from-slate-900/50 via-emerald-900/20 to-sky-800/50"
                                      : "",
                                    "size-full rounded-full p-4 border"
                                  )}
                                >
                                  <GiPianoKeys className="size-16" />
                                </div>
                                Melodic
                              </div>
                            </Listbox.Button>
                            <Listbox.Options className="z-50">
                              {MELODIC_CATEGORIES.map(renderCategory)}
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div className="relative items-start grow flex w-full justify-evenly text-xl font-light gap-4">
                      <Listbox>
                        {({ open }) => (
                          <div className="relative w-full flex flex-col gap-2 total-center">
                            <Listbox.Button>
                              <div className="flex flex-col total-center">
                                <div
                                  className={classNames(
                                    open
                                      ? "bg-gradient-radial from-slate-900/50 via-emerald-900/20 to-sky-800/50"
                                      : "",
                                    "size-full rounded-full p-4 border"
                                  )}
                                >
                                  <GiDrumKit className="size-16" />
                                </div>
                                Percussive
                              </div>
                            </Listbox.Button>
                            <Listbox.Options>
                              {PERCUSSIVE_CATEGORIES.map(renderCategory)}
                            </Listbox.Options>
                          </div>
                        )}
                      </Listbox>
                    </div>
                  </Listbox.Options>
                </div>
              )}
            </Listbox>
            {/* <InstrumentListbox value={instrument} setValue={setInstrument} /> */}
          </div>
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};
