import { PresetScaleList } from "assets/scales";
import classNames from "classnames";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { sample } from "lodash";
import { GiMusicalKeyboard, GiFamilyTree, Gi3DStairs } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { INSTRUMENT_KEYS } from "types/Instrument/InstrumentTypes";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  createDrumTracks,
  createRandomHierarchy,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { createTrackTree } from "types/Track/TrackThunks";

export function TimelineTrackButton() {
  const dispatch = useProjectDispatch();
  const holding = useHeldHotkeys(["alt", "d"]);
  const shouldRandomize = holding.alt;
  const shouldCreateDrums = holding.d;
  return (
    <div
      className={classNames(
        "rdg-track group size-full flex total-center text-xs",
        "hover:bg-indigo-500/30",
        "transition-all rounded cursor-pointer"
      )}
    >
      <div className="hidden group-hover:flex group-hover:animate-in group-hover:fade-in group-hover:duration-300 gap-6 *:rounded-full text-slate-100">
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              createScaleTrack(
                {},
                shouldRandomize ? sample(PresetScaleList) : undefined
              )
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
            <Gi3DStairs className="text-4xl" />
          </div>
          Scale Track
        </div>
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              createPatternTrack(
                {},
                shouldRandomize ? sample(INSTRUMENT_KEYS) : undefined
              )
            )
          }
        >
          <div
            className={`size-14 flex total-center rounded-full border-2 border-emerald-400 ${
              shouldRandomize
                ? "hover:border-fuchsia-400"
                : "hover:border-white"
            }`}
          >
            <GiMusicalKeyboard className="text-4xl" />
          </div>
          Pattern Track
        </div>
        <div
          className="flex flex-col gap-2 pt-1 items-center"
          onClick={() =>
            dispatch(
              shouldCreateDrums
                ? createDrumTracks()
                : shouldRandomize
                ? createRandomHierarchy()
                : createTrackTree()
            )
          }
        >
          <div
            className={`size-14 flex total-center rounded-full border-2 border-purple-400 ${
              shouldRandomize
                ? "hover:border-fuchsia-400"
                : "hover:border-white"
            }`}
          >
            <GiFamilyTree className="text-4xl rotate-180" />
          </div>
          Track Tree
        </div>
      </div>
    </div>
  );
}
