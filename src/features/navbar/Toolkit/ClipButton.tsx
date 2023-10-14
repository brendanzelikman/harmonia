import { BsBrush } from "react-icons/bs";
import { ControlButton } from ".";
import { NavbarTooltip } from "../components";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectSelectedPattern, selectTimeline } from "redux/selectors";
import { toggleAddingClips } from "redux/thunks";
import { isAddingClips } from "types/Timeline";

/**
 * Add a clip of the selected pattern to the timeline.
 */
export const ToolkitClipButton = () => {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector(selectTimeline);
  const isAdding = isAddingClips(timeline);
  const selectedPattern = useAppSelector(selectSelectedPattern);
  const patternName = selectedPattern?.name;

  const ClipButton = () => {
    const buttonClass = isAdding
      ? "bg-cyan-700 ring-2 ring-offset-2 ring-cyan-600/80 ring-offset-black"
      : "bg-cyan-700/80";

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
        className="-translate-x-1/2 left-8 bg-cyan-700/80 px-2 backdrop-blur"
        show={!!isAdding}
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
