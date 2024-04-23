import { BsScissors } from "react-icons/bs";
import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { isTimelineSlicingClips } from "types/Timeline";
import { toggleSlicingMedia } from "redux/thunks";
import classNames from "classnames";

export const NavbarSliceClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isSlicing = isTimelineSlicingClips(timeline);

  const SliceButton = () => {
    const buttonClass = classNames(
      `bg-gradient-to-r from-slate-600 to-slate-600 via-slate-500 border-slate-400/50`,
      isSlicing
        ? "ring-2 ring-offset-2 ring-slate-500/80 ring-offset-black"
        : ""
    );
    return (
      <NavbarTooltipButton
        label={isSlicing ? "Stop Slicing Pattern Clips" : "Slice Pattern Clips"}
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
        content="Slice a Pattern Clip"
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
