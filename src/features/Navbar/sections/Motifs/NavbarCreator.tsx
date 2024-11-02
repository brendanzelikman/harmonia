import { use, useDeep, useProjectDispatch } from "types/hooks";
import { GiHealthNormal } from "react-icons/gi";
import classNames from "classnames";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import {
  selectNewMotifName,
  selectSelectedPatternTrack,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";

import {
  selectTrackInstrumentKey,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { selectSelectedTrackScaleNames } from "types/Arrangement/ArrangementScaleSelectors";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";
import { createScale } from "types/Scale/ScaleThunks";
import { blurOnEnter } from "utils/html";
import {
  toolkitMotifBackground,
  toolkitMotifBorder,
} from "features/Navbar/components/NavbarStyles";
import { useStates } from "hooks/useStates";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { ClipType } from "types/Clip/ClipTypes";

export const NavbarCreator = (props: { type?: ClipType }) => {
  const dispatch = useProjectDispatch();
  const type = use((_) => props.type ?? selectTimelineType(_));
  const names = useStates({ pattern: "", pose: "", scale: "" });
  const newName = use((_) => selectNewMotifName(_, type));

  // Get info about the current pattern track
  const patternTrack = use(selectSelectedPatternTrack);
  const ptId = patternTrack?.id;
  const hasTrack = !!patternTrack;
  const label = use((_) => selectTrackLabelById(_, ptId));
  const nameChain = useDeep(selectSelectedTrackScaleNames);
  const instrumentKey = use((_) => selectTrackInstrumentKey(_, ptId));
  const instrumentName = getInstrumentName(instrumentKey);

  // Create a new motif based on the given type
  const createMotif = {
    pattern: () =>
      dispatch(
        createPattern({
          data: { name: names.pattern, trackId: ptId, instrumentKey },
        })
      ),
    pose: () => dispatch(createPose({ data: { name: names.pose } })),
    scale: () => dispatch(createScale({ data: { name: names.scale } })),
  }[type];

  return (
    <div className="relative">
      <div
        className={classNames(
          "peer w-min px-2 z-[50] capitalize text-sm flex border border-slate-400/50 text-slate-200 rounded total-center cursor-pointer transition-all",
          `hover:ring-2 hover:ring-slate-300 active:ring-2 active:ring-offset-2 active:ring-offset-black`,
          toolkitMotifBackground[type],
          activeRing[type]
        )}
        onClick={() => {
          createMotif();
          names.clear(type);
        }}
      >
        New {type}
      </div>
      <NavbarHoverTooltip
        group="peer-hover:block hover/tooltip:block"
        top="top-4"
        className={`-left-16 capitalize whitespace-nowrap transition-all ${activeText[type]}`}
        padding="py-2 px-3"
        borderColor={toolkitMotifBorder[type]}
      >
        <div className="min-w-56 flex flex-col gap-2">
          <div className="flex w-full gap-3 py-2">
            <p className="flex-1 text-slate-50">Name:</p>
            <input
              className="h-6 max-w-min text-sm bg-slate-800 text-slate-50 rounded"
              placeholder={newName}
              value={names[type]}
              onChange={(e) => names.set(type, e.target.value)}
              onKeyDown={blurOnEnter}
            />
          </div>
          {type === "pattern" && (
            <>
              <div className="flex gap-3">
                <span className="flex-1 text-slate-50">Pattern Track:</span>
                <span
                  className={classNames(
                    hasTrack ? "text-emerald-400" : "text-slate-400"
                  )}
                >
                  {hasTrack
                    ? `(Track ${label}) ${instrumentName}`
                    : "None Selected"}
                </span>
              </div>
              {hasTrack && (
                <div className="flex gap-8 text-slate-400">
                  <span className="flex-1 text-slate-50">Scales Included:</span>
                  <ul className="text-right">
                    {nameChain.map((name) => (
                      <li key={name} className="text-sky-400">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};

export const activeRing = {
  pattern: "active:ring-emerald-500",
  pose: "active:ring-fuchsia-500",
  scale: "active:ring-sky-500",
};

export const activeText = {
  pattern: "peer-active:text-emerald-500",
  pose: "peer-active:text-pink-500",
  scale: "peer-active:text-sky-500",
};
