import { use, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { isFiniteNumber } from "types/util";
import pluralize from "pluralize";
import { PPQ } from "utils/durations";
import {
  ClipType,
  PatternClip,
  PoseClip,
  ScaleClip,
} from "types/Clip/ClipTypes";
import { updateMediaDraft } from "types/Timeline/TimelineSlice";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import {
  selectSelectedMotif,
  selectDraftedClip,
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  selectSelectedMotifDuration,
  selectSelectedMotifName,
} from "types/Arrangement/ArrangementScaleSelectors";
import { toggleAddingState } from "types/Timeline/TimelineThunks";
import {
  toolkitClipBackground,
  toolkitClipBorder,
  toolkitClipText,
  toolkitToolIcon,
  toolkitToolName,
} from "features/Navbar/components/NavbarStyles";
import { useMemo } from "react";
import { format } from "utils/math";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

export const NavbarArranger = ({ type }: { type: ClipType }) => {
  const dispatch = useProjectDispatch();
  const timelineType = use(selectTimelineType);
  const isAdding = use(selectIsAddingClips);
  const hasTracks = use(selectHasTracks);
  const draft = use(selectDraftedClip);
  const motif = use((_) => selectSelectedMotif(_, type));
  const motifName = use((_) => selectSelectedMotifName(_, type));
  const motifDuration = use((_) => selectSelectedMotifDuration(_, type));
  const disabled = motif === undefined || !hasTracks;
  const active = isAdding && timelineType === type && !disabled;

  const draftDuration = draft?.duration;
  const draftOffset = draft?.offset;
  const isFiniteDuration = isFiniteNumber(draftDuration);
  const isFiniteOffset = isFiniteNumber(draftOffset);
  const draftBars = format((draftDuration ?? NaN) / (4 * PPQ), 6);
  const draftBarString = isNaN(draftBars) ? "" : draftBars;
  const canHaveOffset = type !== "scale" && isFiniteDuration;

  // The duration is formatted to display the number of bars and ticks
  const durationString = useMemo(() => {
    if (isFiniteDuration) {
      return `${barString(draftDuration)} / ${tickString(draftDuration)}`;
    }
    if (type === "scale") {
      return "Infinite";
    }
    if (draftDuration === undefined && isFiniteNumber(motifDuration)) {
      return `${barString(motifDuration)} / ${tickString(motifDuration)}`;
    }
    return "Infinite";
  }, [draftDuration, motifDuration, type]);

  // The draft is updated accordingly based on the given type
  const updateDraft = {
    pattern: (patternClip: Partial<PatternClip>) => {
      dispatch(updateMediaDraft({ data: { patternClip } }));
    },
    pose: (poseClip: Partial<PoseClip>) => {
      dispatch(updateMediaDraft({ data: { poseClip } }));
    },
    scale: (scaleClip: Partial<ScaleClip>) => {
      dispatch(updateMediaDraft({ data: { scaleClip } }));
    },
  }[type];

  return (
    <div className="flex group relative" id={`add-${type}-button`}>
      <div
        className={classNames(
          toolkitClipBackground[type],
          "border-slate-400/50 transition-all size-8 xl:size-9 flex total-center rounded-full",
          { "cursor-default opacity-75": disabled },
          { "cursor-pointer opacity-100": !disabled },
          { "hover:ring-2 hover:ring-slate-300": !disabled },
          { [`ring-2 ring-offset-2 ring-offset-black ${ringColor}`]: active }
        )}
        onClick={() => !disabled && dispatch(toggleAddingState({ data: type }))}
      >
        {toolkitToolIcon[type]}
      </div>
      {!disabled && (
        <NavbarHoverTooltip
          className="-left-16 whitespace-nowrap text-slate-400"
          borderColor={toolkitClipBorder[type]}
        >
          <div className="flex flex-col gap-2 text-sm">
            <p
              className={classNames(
                `capitalize font-light border-b pb-2 border-b-slate-500/50 transition-all`,
                active ? toolkitClipText[type] : "text-slate-50"
              )}
            >
              {active ? "Hide" : "Equip"}
              {` ${toolkitToolName[type]} `}
              <span className="font-bold">({motifName})</span>
            </p>
            <p>
              Duration:{" "}
              <span className="text-slate-50 font-bold">{durationString} </span>
            </p>
            <input
              type="number"
              value={draftBarString}
              className="w-full h-6 border rounded px-2 py-1 text-sm bg-slate-800 text-white"
              placeholder="Duration (bars)"
              onChange={(e) =>
                updateDraft({
                  duration: isFiniteNumber(e.currentTarget.valueAsNumber)
                    ? e.currentTarget.valueAsNumber * 4 * PPQ
                    : undefined,
                })
              }
            />
            {canHaveOffset && (
              <>
                <p>
                  Offset:{" "}
                  <span className="font-bold text-slate-50">
                    {isFiniteOffset ? draftOffset : "0"}{" "}
                    {pluralize("tick", draftOffset)}
                  </span>
                </p>
                <input
                  type="number"
                  value={draftOffset === 0 ? "" : draftOffset}
                  className="w-full h-6 border px-2 py-1 text-sm bg-slate-800 text-white rounded"
                  placeholder="Offset (ticks)"
                  onChange={(e) =>
                    updateDraft({
                      offset: isFiniteNumber(e.currentTarget.valueAsNumber)
                        ? e.currentTarget.valueAsNumber
                        : 0,
                    })
                  }
                />
              </>
            )}
          </div>
        </NavbarHoverTooltip>
      )}
    </div>
  );
};

const ringColor = {
  pattern: "ring-pattern-clip/80",
  pose: "ring-pose-clip/80",
  scale: "ring-blue-400/80",
};

const barString = (duration: number) => {
  const bars = duration ? duration / (PPQ * 4) : 0;
  const parsedBar = format(bars, 6);
  const pluralBars = pluralize("bar", parsedBar);
  return `${parsedBar} ${pluralBars}`;
};

const tickString = (duration: number) => {
  const parsedDuration = format(duration, 6);
  const pluralTicks = pluralize("tick", duration);
  return `${parsedDuration} ${pluralTicks}`;
};
