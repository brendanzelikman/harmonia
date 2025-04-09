import { PresetScaleList } from "assets/scales";
import classNames from "classnames";
import { useHeldHotkeys } from "lib/hotkeys";
import { sample } from "lodash";
import { CiRuler } from "react-icons/ci";
import { GiMusicalKeyboard, GiFamilyTree } from "react-icons/gi";
import { useDispatch } from "hooks/useStore";
import { INSTRUMENT_KEYS } from "types/Instrument/InstrumentTypes";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  createDrumTracks,
  createRandomHierarchy,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { createTreeFromString } from "utils/tree";

export function TimelineTrackButton() {
  const dispatch = useDispatch();
  const holding = useHeldHotkeys(["alt", "d"]);
  const shouldRandomize = holding.alt;
  const shouldCreateDrums = holding.d;
  return (
    <div
      className={classNames(
        "group size-full flex total-center text-xs",
        "hover:bg-indigo-500/30",
        "transition-all rounded cursor-pointer"
      )}
    >
      <div className="hidden group-hover:flex group-hover:animate-in group-hover:fade-in group-hover:duration-300 gap-6 *:rounded-full text-slate-100">
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              createScaleTrack({
                data: {
                  scale: shouldRandomize ? sample(PresetScaleList) : undefined,
                },
              })
            )
          }
        >
          <div
            className={`size-14 flex total-center rounded-full border-2 border-sky-400 ${
              shouldRandomize
                ? "hover:border-fuchsia-400"
                : "hover:border-white"
            }`}
          >
            <CiRuler className="text-5xl" />
          </div>
          Scale
        </div>
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              createPatternTrack({
                data: {
                  instrument: {
                    key: shouldRandomize ? sample(INSTRUMENT_KEYS) : undefined,
                  },
                },
              })
            )
          }
        >
          <div
            className={`size-14 flex total-center rotate-90 rounded-full border-2 border-emerald-400 ${
              shouldRandomize
                ? "hover:border-fuchsia-400"
                : "hover:border-white"
            }`}
          >
            <GiMusicalKeyboard className="text-4xl" />
          </div>
          Sampler
        </div>
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              shouldCreateDrums
                ? createDrumTracks()
                : shouldRandomize
                ? createRandomHierarchy()
                : createTreeFromString({ data: "major => piano" })
            )
          }
        >
          <div
            className={`size-14 flex total-center rounded-full border-2 border-teal-500 ${
              shouldRandomize ? "hover:border-teal-400" : "hover:border-white"
            }`}
          >
            <GiFamilyTree className="text-4xl rotate-180" />
          </div>
          Tree
        </div>
      </div>
    </div>
  );
}
