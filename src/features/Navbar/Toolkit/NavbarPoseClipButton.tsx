import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectSelectedPose, selectTimeline } from "redux/selectors";
import { toggleAddingPoseClips } from "redux/thunks";
import { isTimelineAddingPoseClips } from "types/Timeline";
import { GiCrystalWand } from "react-icons/gi";
import classNames from "classnames";

export const NavbarPoseClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const selectedPose = useProjectSelector(selectSelectedPose);
  const active = isTimelineAddingPoseClips(timeline) && !!selectedPose;
  const poseName = selectedPose?.name ?? "Pose";

  const PoseClipButton = () => {
    const buttonClass = classNames(
      "bg-fuchsia-600 border-slate-400/50",
      active ? "ring-2 ring-offset-2 ring-fuchsia-500/80 ring-offset-black" : ""
    );

    return (
      <NavbarToolkitButton
        label="Add Pattern Clip"
        className={buttonClass}
        onClick={() => dispatch(toggleAddingPoseClips())}
      >
        <GiCrystalWand className="p-0.5" />
      </NavbarToolkitButton>
    );
  };

  const PoseClipTooltip = () => {
    if (!selectedPose) return null;
    return (
      <NavbarTooltip
        className="-translate-x-1/2 left-8 bg-fuchsia-500/80 px-2 backdrop-blur"
        show={!!active}
        content={`Arranging ${poseName}`}
      />
    );
  };

  return (
    <div className="relative" id="add-pose-button">
      <PoseClipButton />
      {PoseClipTooltip()}
    </div>
  );
};
