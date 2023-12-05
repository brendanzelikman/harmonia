import { BsScissors } from "react-icons/bs";
import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
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
      <NavbarToolkitButton
        label="Slice Clip"
        className={buttonClass}
        onClick={() => dispatch(toggleSlicingMedia())}
      >
        <BsScissors />
      </NavbarToolkitButton>
    );
  };

  const SliceTooltip = () => {
    const tooltipClass = "bg-slate-600/80 px-2 backdrop-blur";
    return (
      <NavbarTooltip
        content="Slicing Clip"
        className={tooltipClass}
        show={!!isSlicing}
      />
    );
  };

  return (
    <div className="relative">
      <SliceButton />
      {SliceTooltip()}
    </div>
  );
};
