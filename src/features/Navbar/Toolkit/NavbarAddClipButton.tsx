import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { createPattern, createPose } from "redux/thunks";
import { GiHeartPlus } from "react-icons/gi";
import classNames from "classnames";

export const NavbarAddClipButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const clipType = timeline.selectedClipType;
  const onPattern = clipType === "pattern";

  const Button = () => (
    <NavbarTooltipButton
      label={`Create a New ${clipType}`}
      className={classNames(
        onPattern
          ? "bg-emerald-600 active:ring-2 active:ring-emerald-500"
          : "bg-fuchsia-500 active:ring-2 active:ring-fuchsia-400",
        "capitalize border-slate-400/50 transition-transform"
      )}
      keepTooltipOnClick
      onClick={() => dispatch(onPattern ? createPattern() : createPose())}
    >
      <GiHeartPlus className="p-0.5" />
    </NavbarTooltipButton>
  );

  return (
    <div className="relative" id="add-clip-button">
      {Button()}
    </div>
  );
};
