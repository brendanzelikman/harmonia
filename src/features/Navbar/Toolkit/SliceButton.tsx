import { BsScissors } from "react-icons/bs";
import { ControlButton } from ".";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { isTimelineSlicingMedia } from "types/Timeline";
import { toggleSlicingMedia } from "redux/thunks";

/**
 * Slice media at a pivot point.
 */
export const ToolkitSliceButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isSlicing = isTimelineSlicingMedia(timeline);

  const SliceButton = () => {
    const buttonClass = isSlicing
      ? "bg-slate-600 ring-2 ring-offset-2 ring-slate-500/80 ring-offset-black"
      : "bg-slate-600/80";
    return (
      <ControlButton
        label="Slice Track Media"
        className={buttonClass}
        onClick={() => dispatch(toggleSlicingMedia())}
      >
        <BsScissors />
      </ControlButton>
    );
  };

  const SliceTooltip = () => {
    const tooltipClass = "left-[-3.2rem] bg-slate-600/80 px-2 backdrop-blur";
    return (
      <NavbarTooltip
        content="Portaling Track Media"
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
