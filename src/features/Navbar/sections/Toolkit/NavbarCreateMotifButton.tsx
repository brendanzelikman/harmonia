import { use, useDeep, useProjectDispatch } from "types/hooks";
import { GiHealthNormal } from "react-icons/gi";
import classNames from "classnames";
import { NavbarHoverTooltip } from "features/Navbar/components";
import { useState } from "react";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import {
  selectNewMotifName,
  selectSelectedPatternTrack,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackLabelMap,
  selectTrackInstrumentKey,
  selectTrackChain,
} from "types/Track/TrackSelectors";
import { selectScaleNameMap } from "types/Arrangement/ArrangementTrackSelectors";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";
import { createScale } from "types/Scale/ScaleThunks";
import { blurOnEnter } from "utils/html";
import { NavbarToolkitProps } from "../NavbarToolkitSection";

export const NavbarCreateMotifButton = ({
  type,
  motifBackground,
  motifBorder,
}: NavbarToolkitProps) => {
  const dispatch = useProjectDispatch();

  const [names, setNames] = useState({ pattern: "", pose: "", scale: "" });
  const setName = (name: string, type: string) =>
    setNames((prev) => ({ ...prev, [type]: name }));
  const clearName = (type: string) =>
    setNames((prev) => ({ ...prev, [type]: "" }));
  const newMotifName = use((_) => selectNewMotifName(_, type));
  const track = use(selectSelectedPatternTrack);
  const instrumentKey = use((_) => selectTrackInstrumentKey(_, track?.id));
  const hasTrack = !!track;
  const labelMap = use(selectTrackLabelMap);
  const scaleNameMap = use(selectScaleNameMap);

  const instrumentName = getInstrumentName(instrumentKey);
  const chain = useDeep((_) => selectTrackChain(_, track?.id));
  const label = track ? labelMap[track.id] : "";

  const activeRing = {
    pattern: "active:ring-emerald-500",
    pose: "active:ring-fuchsia-500",
    scale: "active:ring-sky-500",
  }[type];

  const activeText = {
    pattern: "peer-active:text-emerald-500",
    pose: "peer-active:text-pink-500",
    scale: "peer-active:text-sky-500",
  }[type];

  const createMotif = {
    pattern: () =>
      dispatch(
        createPattern({
          data: {
            name: names.pattern,
            patternTrackId: track?.id,
            instrumentKey,
          },
        })
      ),
    pose: () => dispatch(createPose({ data: { name: names.pose } })),
    scale: () => dispatch(createScale({ data: { name: names.scale } })),
  }[type];

  const callback = () => {
    createMotif();
    clearName(type);
  };

  const Button = () => (
    <div
      className={classNames(
        "peer size-8 xl:size-9 flex total-center cursor-pointer transition-all",
        `${motifBackground} border border-slate-400/50 rounded-full`,
        `hover:ring-2 hover:ring-slate-300 active:ring-2 active:ring-offset-2 active:ring-offset-black ${activeRing}`
      )}
      onClick={callback}
    >
      <GiHealthNormal className="p-0.5" />
    </div>
  );

  const Tooltip = () => (
    <NavbarHoverTooltip
      className={`-left-16 capitalize whitespace-nowrap transition-all ${activeText}`}
      padding="py-2 px-3"
      borderColor={motifBorder}
    >
      <div className="min-w-56 flex flex-col gap-2">
        <p className={classNames("border-b border-b-slate-500 pb-2")}>
          Create New {type}
        </p>
        <div className="flex w-full gap-3 py-2">
          <p className="flex-1 text-slate-50">Name:</p>
          <input
            className="h-6 max-w-min text-sm bg-slate-800 text-slate-50 rounded"
            placeholder={newMotifName}
            value={names[type]}
            onChange={(e) => setName(e.target.value, type)}
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
                {track ? `(Track ${label}) ${instrumentName}` : "None Selected"}
              </span>
            </div>
            {hasTrack && (
              <div className="flex gap-8">
                <span className="flex-1 text-slate-50">Scales Included:</span>
                <ul className="text-right">
                  {chain.map((c) => (
                    <li key={c.id} className="text-sky-400">
                      {scaleNameMap[c.scaleId]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </NavbarHoverTooltip>
  );

  return (
    <div className="relative group" id="add-clip-button">
      {Button()}
      {Tooltip()}
    </div>
  );
};
