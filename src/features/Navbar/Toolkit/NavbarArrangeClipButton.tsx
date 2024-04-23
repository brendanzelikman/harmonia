import { BsBrush } from "react-icons/bs";
import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import {
  selectSelectedPattern,
  selectSelectedPose,
  selectTimeline,
} from "redux/selectors";
import { toggleAddingPatternClips, toggleAddingPoseClips } from "redux/thunks";
import {
  isTimelineAddingPatternClips,
  isTimelineAddingPoseClips,
} from "types/Timeline";
import classNames from "classnames";
import { GiCrystalWand } from "react-icons/gi";

export const NavbarArrangeClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const { selectedClipType } = timeline;
  const onPatterns = selectedClipType === "pattern";
  const active = onPatterns
    ? isTimelineAddingPatternClips(timeline)
    : isTimelineAddingPoseClips(timeline);

  const selectedPattern = useProjectSelector(selectSelectedPattern);
  const selectedPose = useProjectSelector(selectSelectedPose);
  const patternName = selectedPattern?.name ?? "Pattern";
  const poseName = selectedPose?.name ?? "Pose";
  const name = onPatterns ? patternName : poseName;

  const ArrangeClipButton = () => {
    const buttonClass = classNames(
      onPatterns ? "bg-pattern-clip/80" : "bg-pose-clip/80",
      "border-slate-400/50",
      active
        ? `ring-2 ring-offset-2 ring-offset-black ${
            onPatterns ? "ring-pattern-clip/80" : "ring-pose-clip/80"
          }`
        : ""
    );
    const Icon = onPatterns ? BsBrush : GiCrystalWand;
    return (
      <NavbarTooltipButton
        label={
          active
            ? `Stop Arranging ${selectedClipType} Clips`
            : `Arrange ${selectedClipType} Clips`
        }
        className={buttonClass}
        onClick={() =>
          dispatch(
            onPatterns ? toggleAddingPatternClips() : toggleAddingPoseClips()
          )
        }
      >
        <Icon className="p-0.5" />
      </NavbarTooltipButton>
    );
  };

  const PatternClipTooltip = () => {
    if (!selectedPattern) return null;
    return (
      <NavbarTooltip
        className={classNames(
          `-translate-x-1/2 left-8 px-2 backdrop-blur`,
          onPatterns ? `bg-pattern-clip/80` : `bg-fuchsia-500/80`
        )}
        show={!!active}
        content={`Arranging ${name}`}
      />
    );
  };

  return (
    <div className="relative" id={`add-${selectedClipType}-button`}>
      {ArrangeClipButton()}
      {PatternClipTooltip()}
    </div>
  );
};
