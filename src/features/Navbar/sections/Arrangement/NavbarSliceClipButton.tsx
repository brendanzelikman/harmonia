import { BsScissors } from "react-icons/bs";
import { NavbarTooltipButton } from "../../../../components/TooltipButton";
import { NavbarTooltip } from "../../components";
import { useDeep, useProjectDispatch, useProjectSelector } from "types/hooks";
import classNames from "classnames";
import { isTimelineSlicingClips } from "types/Timeline/TimelineFunctions";
import { selectTimeline } from "types/Timeline/TimelineSelectors";
import { selectClipIds } from "types/Clip/ClipSelectors";
import { toggleSlicingMedia } from "types/Timeline/TimelineThunks";

export const NavbarSliceClipButton = () => {
  const dispatch = useProjectDispatch();
  const hasClips = useDeep(selectClipIds).length > 0;
  const timeline = useProjectSelector(selectTimeline);
  const isSlicing = isTimelineSlicingClips(timeline);

  const SliceButton = () => {
    const buttonClass = classNames(
      `bg-gradient-to-r from-slate-600 to-slate-600 via-slate-500 border-slate-400/50`,
      !hasClips ? "opacity-50" : "cursor-pointer",
      isSlicing
        ? "ring-2 ring-offset-2 ring-slate-500/80 ring-offset-black"
        : ""
    );
    return (
      <NavbarTooltipButton
        disabled={!hasClips}
        label={isSlicing ? "Stop Slicing Clips" : "Slice Clips"}
        className={buttonClass}
        onClick={() => dispatch(toggleSlicingMedia())}
      >
        <BsScissors />
      </NavbarTooltipButton>
    );
  };

  const SliceTooltip = () => {
    const tooltipClass = "left-[-3rem] bg-slate-600/80 px-2 backdrop-blur";
    return (
      <NavbarTooltip
        content="Click A Clip To Slice"
        className={tooltipClass}
        show={!!isSlicing}
      />
    );
  };

  return (
    <div className="relative">
      {SliceButton()}
      {SliceTooltip()}
    </div>
  );
};
