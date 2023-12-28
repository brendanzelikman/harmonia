import { BsBrush } from "react-icons/bs";
import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectSelectedPattern, selectTimeline } from "redux/selectors";
import { toggleAddingPatternClips } from "redux/thunks";
import { isTimelineAddingPatternClips } from "types/Timeline";
import classNames from "classnames";

export const NavbarPatternClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const active = isTimelineAddingPatternClips(timeline);
  const selectedPattern = useProjectSelector(selectSelectedPattern);
  const patternName = selectedPattern?.name;

  const PatternClipButton = () => {
    const buttonClass = classNames(
      "bg-pattern-clip/80 border-slate-400/50",
      active
        ? "ring-2 ring-offset-2 ring-pattern-clip/80 ring-offset-black"
        : ""
    );
    return (
      <NavbarToolkitButton
        label="Add Pattern Clip"
        className={buttonClass}
        onClick={() => dispatch(toggleAddingPatternClips())}
      >
        <BsBrush className="p-0.5" />
      </NavbarToolkitButton>
    );
  };

  const PatternClipTooltip = () => {
    if (!selectedPattern) return null;
    return (
      <NavbarTooltip
        className="-translate-x-1/2 left-8 bg-pattern-clip/80 px-2 backdrop-blur"
        show={!!active}
        content={`Arranging ${patternName}`}
      />
    );
  };

  return (
    <div className="relative" id="add-pattern-button">
      <PatternClipButton />
      {PatternClipTooltip()}
    </div>
  );
};
