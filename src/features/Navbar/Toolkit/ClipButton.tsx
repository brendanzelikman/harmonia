import { BsBrush } from "react-icons/bs";
import { ControlButton } from ".";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectSelectedPattern, selectTimeline } from "redux/selectors";
import { toggleAddingClips } from "redux/thunks";
import { isTimelineAddingClips } from "types/Timeline";

/**
 * Add a clip of the selected pattern to the timeline.
 */
export const ToolkitClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isAddingClips = isTimelineAddingClips(timeline);
  const selectedPattern = useProjectSelector(selectSelectedPattern);
  const patternName = selectedPattern?.name;

  const ClipButton = () => {
    const buttonClass = isAddingClips
      ? "bg-teal-500 ring-2 ring-offset-2 ring-teal-500/80 ring-offset-black"
      : "bg-teal-500/80";

    return (
      <ControlButton
        label="Add Pattern Clip"
        className={buttonClass}
        onClick={() => dispatch(toggleAddingClips())}
      >
        <BsBrush className="p-0.5" />
      </ControlButton>
    );
  };

  const ClipTooltip = () => {
    if (!selectedPattern) return null;
    return (
      <NavbarTooltip
        className="-translate-x-1/2 left-8 bg-teal-500/80 px-2 backdrop-blur"
        show={!!isAddingClips}
        content={`Adding ${patternName}`}
      />
    );
  };

  return (
    <div className="relative" id="add-pattern-button">
      <ClipButton />
      {ClipTooltip()}
    </div>
  );
};
