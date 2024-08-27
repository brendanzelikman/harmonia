import { useProjectDispatch, useProjectSelector } from "types/hooks";
import classNames from "classnames";
import { GiDoubleQuaver, GiDramaMasks, GiTeleport } from "react-icons/gi";
import { isFiniteNumber } from "types/util";
import pluralize from "pluralize";
import { NavbarHoverTooltip } from "features/Navbar/components";
import { NavbarToolkitProps } from "./NavbarToolkitSection";
import { PPQ } from "utils/durations";
import { PatternClip, PoseClip, ScaleClip } from "types/Clip/ClipTypes";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { updateMediaDraft } from "types/Timeline/TimelineSlice";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import {
  selectSelectedPattern,
  selectSelectedPose,
  selectIsTimelineAddingSelectedClip,
  selectSelectedMotif,
  selectDraftedClip,
} from "types/Timeline/TimelineSelectors";
import { selectSelectedMotifName } from "types/Arrangement/ArrangementScaleSelectors";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import {
  toggleAddingPatternClips,
  toggleAddingPoseClips,
  toggleAddingScaleClips,
} from "types/Timeline/TimelineThunks";

export const NavbarArrangeClipButton = ({
  type,
  clipBorder,
  clipText,
  clipBackground,
}: NavbarToolkitProps) => {
  const dispatch = useProjectDispatch();
  const selectedPattern = useProjectSelector(selectSelectedPattern);
  const selectedPose = useProjectSelector(selectSelectedPose);

  const active = useProjectSelector(selectIsTimelineAddingSelectedClip);
  const hasTracks = useProjectSelector(selectHasTracks);
  const disabled =
    useProjectSelector(selectSelectedMotif) === undefined || !hasTracks;
  const name = useProjectSelector(selectSelectedMotifName);
  const draft = useProjectSelector(selectDraftedClip);
  const formatDecimal = (value: number) => parseFloat(value.toFixed(6));

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

  const duration = draft?.duration;
  const isFiniteDuration = isFiniteNumber(duration);

  const tickString = (duration: number) => {
    const parsedDuration = formatDecimal(duration);
    const pluralTicks = pluralize("tick", duration);
    return `${parsedDuration} ${pluralTicks}`;
  };

  const barString = (duration: number) => {
    const bars = duration ? duration / (PPQ * 4) : 0;
    const parsedBar = formatDecimal(bars);
    const pluralBars = pluralize("bar", parsedBar);
    return `${parsedBar} ${pluralBars}`;
  };

  const patternDuration = getPatternDuration(selectedPattern);
  const poseDuration = getPoseDuration(selectedPose);
  const streamDuration = {
    pattern: patternDuration,
    pose: poseDuration,
    scale: 0,
  }[type];

  const motifDuration = isFiniteDuration
    ? `${barString(duration)} / ${tickString(duration)}`
    : type === "scale"
    ? "Infinite"
    : duration === undefined && isFiniteNumber(streamDuration)
    ? `${barString(streamDuration)} / ${tickString(streamDuration)}`
    : "Infinite";

  const offset = draft?.offset;
  const isFiniteOffset = isFiniteNumber(offset);

  const ringColor = {
    pattern: "ring-pattern-clip/80",
    pose: "ring-pose-clip/80",
    scale: "ring-blue-400/80",
  }[type];

  const Icon = {
    pattern: GiDoubleQuaver,
    pose: GiDramaMasks,
    scale: GiTeleport,
  }[type];

  const callback = {
    pattern: () => dispatch(toggleAddingPatternClips()),
    pose: () => dispatch(toggleAddingPoseClips()),
    scale: () => dispatch(toggleAddingScaleClips()),
  }[type];

  const Button = () => {
    const buttonClass = classNames(
      clipBackground,
      "border-slate-400/50 transition-all",
      "size-8 xl:size-9 flex total-center rounded-full",
      disabled
        ? "cursor-default opacity-75"
        : "cursor-pointer opacity-100 hover:ring-2 hover:ring-slate-300",
      disabled
        ? ""
        : active
        ? `ring-2 ring-offset-2 ring-offset-black ${ringColor}`
        : ""
    );

    return (
      <div
        className={buttonClass}
        onClick={() => (disabled ? null : callback())}
      >
        <Icon className="p-0.5" />
      </div>
    );
  };

  const Title = (
    <p
      className={classNames(
        `capitalize font-light border-b pb-2 border-b-slate-500/50 transition-all`,
        active ? clipText : "text-slate-50"
      )}
    >
      {active ? "Arranging" : "Arrange"}{" "}
      <span className="font-bold">{name}</span>
    </p>
  );

  const bars = formatDecimal((duration ?? NaN) / (4 * PPQ));
  const beatValue = isNaN(bars) ? "" : bars;
  const Duration = (
    <>
      <p>
        Duration:{" "}
        <span className="text-slate-50 font-bold">{motifDuration} </span>
      </p>
      <div className="flex total-center gap-4 *:border *:rounded *:px-2 *:py-1">
        <input
          type="number"
          value={beatValue}
          className="w-full h-6 text-sm bg-slate-800 text-white rounded"
          placeholder="Duration (bars)"
          onChange={(e) =>
            updateDraft({
              duration: isFiniteNumber(e.currentTarget.valueAsNumber)
                ? e.currentTarget.valueAsNumber * 4 * PPQ
                : undefined,
            })
          }
        />
      </div>
    </>
  );

  const Offset = type !== "scale" && isFiniteDuration && (
    <div className="flex flex-col gap-2 pb-2">
      <p>
        Offset:{" "}
        <span className="font-bold text-slate-50">
          {isFiniteOffset ? offset : "0"} {pluralize("tick", offset)}
        </span>
      </p>
      <div className="flex total-center gap-4 *:border *:rounded *:px-2 *:py-1">
        <input
          type="number"
          value={offset === 0 ? "" : offset}
          className="w-full h-6 text-sm bg-slate-800 text-white rounded"
          placeholder="Offset (ticks)"
          onChange={(e) =>
            updateDraft({
              offset: isFiniteNumber(e.currentTarget.valueAsNumber)
                ? e.currentTarget.valueAsNumber
                : 0,
            })
          }
        />
      </div>
    </div>
  );

  const HoverTooltip = () => (
    <NavbarHoverTooltip
      className="-left-16 whitespace-nowrap text-slate-400"
      borderColor={clipBorder}
    >
      <div className="flex flex-col gap-2 text-sm">
        {Title}
        {Duration}
        {Offset}
      </div>
    </NavbarHoverTooltip>
  );

  return (
    <div className="flex group relative" id={`add-${type}-button`}>
      {Button()}
      {!disabled && HoverTooltip()}
    </div>
  );
};
