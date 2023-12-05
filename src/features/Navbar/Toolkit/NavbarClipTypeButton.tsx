import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { GiWaveCrest, GiYarn } from "react-icons/gi";
import { toggleSelectedClipType } from "redux/Timeline";
import classNames from "classnames";

export const NavbarClipTypeButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);

  const clipType = timeline.selectedClipType;
  const onPattern = clipType === "pattern";

  const ClipTypeButton = () => {
    const buttonClass = classNames(
      "border h-7 capitalize bg-slate-800/20",
      onPattern ? "border-emerald-600" : "border-fuchsia-600"
    );
    const Icon = onPattern ? GiYarn : GiWaveCrest;

    return (
      <NavbarToolkitButton
        label={`Add ${clipType} Clip`}
        className={buttonClass}
        onClick={() => dispatch(toggleSelectedClipType())}
      >
        <Icon className="p-0.5" />
      </NavbarToolkitButton>
    );
  };

  return (
    <div className="relative" id="clip-type-button">
      <ClipTypeButton />
    </div>
  );
};
