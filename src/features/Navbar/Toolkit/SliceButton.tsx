import { BsScissors } from "react-icons/bs";
import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { isTimelineSlicingMedia } from "types/Timeline";
import { toggleSlicingMedia } from "redux/thunks";

export const ToolkitSliceButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isSlicing = isTimelineSlicingMedia(timeline);

  const SliceButton = () => {
    const buttonClass = isSlicing
      ? "text-sky-100 bg-slate-600 ring-2 ring-offset-2 ring-slate-500/80 ring-offset-black"
      : "text-sky-100 bg-slate-600";
    return (
      <NavbarToolkitButton
        label="Slice Track Media"
        className={buttonClass}
        onClick={() => dispatch(toggleSlicingMedia())}
      >
        <BsScissors />
      </NavbarToolkitButton>
    );
  };

  const SliceTooltip = () => {
    const tooltipClass = "left-[-3.2rem] bg-slate-600/80 px-2 backdrop-blur";
    return (
      <NavbarTooltip
        content="Slicing Track Media"
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
