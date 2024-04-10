import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { createPattern, createPose } from "redux/thunks";
import { GiCrystalWand, GiHeartPlus } from "react-icons/gi";
import classNames from "classnames";

export const NavbarAddClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const clipType = timeline.selectedClipType;
  const onPattern = clipType === "pattern";

  return (
    <div className="relative" id="add-clip-button">
      <NavbarToolkitButton
        label="New Pattern Clip"
        className={classNames(
          onPattern ? "bg-emerald-600" : "bg-fuchsia-500",
          "border-slate-400/50"
        )}
        onClick={() => dispatch(onPattern ? createPattern() : createPose())}
      >
        <GiHeartPlus className="p-0.5" />
      </NavbarToolkitButton>
    </div>
  );
};
