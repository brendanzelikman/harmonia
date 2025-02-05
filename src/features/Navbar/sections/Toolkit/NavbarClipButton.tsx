import { use, useDeep, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { CLIP_TYPES, ClipType } from "types/Clip/ClipTypes";
import {
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  toggleAddingState,
  toggleTimelineState,
} from "types/Timeline/TimelineThunks";
import {
  toolkitClipBackground,
  toolkitToolIcon,
} from "features/Navbar/components/NavbarStyles";
import { NavbarTooltipButton } from "components/TooltipButton";
import { selectPatternTrackIds } from "types/Track/TrackSelectors";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { GiMusicSpell } from "react-icons/gi";
import { useEffect } from "react";
import { ARRANGE_CLIPS_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";

export const NavbarClipIcon = GiMusicSpell;
export const navbarClipBackground =
  "bg-gradient-radial from-teal-500/90 to-teal-600/50";

export const NavbarClipButton = () => {
  const dispatch = useProjectDispatch();
  const timelineType = use(selectTimelineType);
  const hasTracks = use(selectHasTracks);
  const isAdding = use(selectIsAddingClips);
  const ptIds = useDeep(selectPatternTrackIds);
  const hasPtIds = ptIds.length > 0;
  const active = (type: ClipType) => isAdding && timelineType === type;
  const disabled = (type: ClipType) =>
    !hasTracks || (type === "pattern" && !hasPtIds);

  useEffect(() => {
    if (!hasTracks && isAdding) {
      dispatch(toggleTimelineState({ data: `adding-clips` }));
    }
  }, [hasTracks, isAdding]);

  return (
    <div className="relative group/tooltip">
      <NavbarTooltipButton
        disabledClass="cursor-pointer select-none"
        onClick={() => dispatch(toggleTimelineState({ data: "adding-clips" }))}
        className={classNames(
          navbarClipBackground,
          "size-9 border border-white/20 hover:ring-2 hover:ring-slate-300",
          { "text-emerald-100": isAdding && timelineType === "pattern" },
          { "text-fuchsia-100": isAdding && timelineType === "pose" },
          { "text-sky-100": isAdding && timelineType === "scale" },
          isAdding
            ? `ring-offset-2 ring-offset-black ring-2 ring-opacity-50 ring-emerald-500`
            : ""
        )}
      >
        <NavbarClipIcon />
      </NavbarTooltipButton>
      <NavbarHoverTooltip
        top="top-8"
        borderColor="border-emerald-500"
        className={`-left-44 capitalize whitespace-nowrap transition-all`}
        padding="py-2 px-3"
      >
        <div className="text-xl font-light">
          Create New Clips ({dispatch(ARRANGE_CLIPS_HOTKEY).shortcut})
        </div>
        <div className="text-base mb-3 text-teal-400/80">
          {isAdding
            ? `Scheduling a ${timelineType} Clip`
            : `Schedule a Musical Event`}
        </div>
        <div className="flex gap-2">
          {CLIP_TYPES.map((type) => (
            <button
              key={type}
              className={classNames(
                active(type) ? toolkitClipBackground[type] : "bg-transparent",
                borderColor[type],
                "border capitalize w-32 transition-all rounded-lg text-3xl [&>span]:text-sm px-4 py-4 font-extralight total-center-col",
                { "hover:border-1 hover:border-slate-300": !disabled(type) },
                disabled(type)
                  ? "cursor-default opacity-50"
                  : "cursor-pointer opacity-100"
              )}
              onClick={() =>
                !disabled(type) && dispatch(toggleAddingState({ data: type }))
              }
            >
              {toolkitToolIcon[type]}
              <span className="mt-4">{action[type]}</span>
              <span className="text-zinc-400">
                ({type === "pattern" ? "Pattern" : "All"} Tracks)
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col">
          <div>
            {active(timelineType)
              ? `What is a ${timelineType} Clip?`
              : `What is a Clip?`}
          </div>
          <div className="text-slate-400 normal-case text-wrap">
            {
              explanation[
                isAdding
                  ? timelineType
                  : hasTracks
                  ? "default"
                  : "defaultNoTrack"
              ]
            }
          </div>
          {isAdding ? (
            <>
              <div className="mt-3">How Do I Create A Clip?</div>
              <div className="text-slate-400 normal-case text-wrap">
                Click within a Track to schedule the Clip, then drag it around
                the Timeline and click on its icon to start and stop editing.
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};

const action = {
  scale: "Change Scale",
  pattern: "Create Pattern",
  pose: "Change Pose",
};

const explanation = {
  scale:
    "A Scale Clip can be placed in any Track to replace its Scale, if and only if the number of notes in each scale is the same.",
  pattern:
    "A Pattern Clip can be placed in a Pattern Track to sound out a musical idea using notes based on its inherited scales.",
  pose: "A Pose Clip can be placed in any Track to transform its underlying Scale or Pattern using any set of cascading effects.",
  default:
    "A Clip can be placed in a Track to represent a musical idea at a specific point in time. Click one of the types to get started.",
  defaultNoTrack:
    "A Clip can be placed in a Track to represent a musical idea at a specific point in time. Create some tracks to get started.",
};

const borderColor = {
  pattern: "border-pattern-clip",
  pose: "border-pose-clip",
  scale: "border-blue-400",
};

const subtext = (active: boolean = false) => ({
  pattern: `${active ? "Creating" : "Create"} Pattern Clip`,
  pose: `${active ? "Creating" : "Create"} Pose Clip`,
  scale: `${active ? "Creating" : "Create"} Scale Clip`,
});
