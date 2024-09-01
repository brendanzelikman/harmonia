import { TooltipButton } from "../../../../components/TooltipButton";
import { useProjectDispatch } from "types/hooks";
import { FaPaintBrush } from "react-icons/fa";
import classNames from "classnames";
import pluralize from "pluralize";
import { NavbarHoverTooltip } from "features/Navbar/components";
import { CLIP_TYPES } from "types/Clip/ClipTypes";
import { setTimelineType } from "types/Timeline/TimelineThunks";
import { NavbarToolkitProps } from "../NavbarToolkitSection";

export const NavbarChangeTypeButton = ({
  type,
  types,
  motifBorder,
}: NavbarToolkitProps) => {
  const dispatch = useProjectDispatch();
  const selectedClass = "ring-1 ring-indigo-300/50 bg-indigo-300/20";

  const background = {
    pattern: "hover:bg-emerald-400/50",
    pose: "hover:bg-fuchsia-400/50",
    scale: "hover:bg-sky-400/50",
  }[type];

  const Button = () => (
    <TooltipButton
      className={`flex xl:min-h-9 min-h-8 w-24 border ${motifBorder} capitalize rounded-lg transition-all`}
    >
      <div className="h-full ml-2 mr-auto">
        <FaPaintBrush />
      </div>
      <span className="mr-2 capitalize">{types}</span>
    </TooltipButton>
  );

  const Tooltip = () => (
    <NavbarHoverTooltip borderColor={motifBorder}>
      <ul className="*:px-2 *:rounded *:cursor-pointer">
        {CLIP_TYPES.map((t) => (
          <li
            key={t}
            className={classNames(
              "capitalize transition-all",
              background,
              type === t ? selectedClass : ""
            )}
            onClick={() => dispatch(setTimelineType({ data: t }))}
          >
            {pluralize(t, 2)}
          </li>
        ))}
      </ul>
    </NavbarHoverTooltip>
  );

  return (
    <div
      className="flex group relative font-light space-x-2 text-sm items-center"
      id="clip-type-button"
    >
      {Button()}
      {Tooltip()}
    </div>
  );
};
