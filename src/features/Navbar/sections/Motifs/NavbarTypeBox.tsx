import { use, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import pluralize from "pluralize";
import { CLIP_TYPES } from "types/Clip/ClipTypes";
import { setTimelineType } from "types/Timeline/TimelineThunks";
import { toolkitMotifBorder } from "features/Navbar/components/NavbarStyles";
import { selectTimelineType } from "types/Timeline/TimelineSelectors";
import { GiAtomicSlashes } from "react-icons/gi";
import { TooltipButton } from "components/TooltipButton";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

export const NavbarTypeBox = () => {
  const type = use(selectTimelineType);
  const dispatch = useProjectDispatch();
  const borderColor = toolkitMotifBorder[type];

  return (
    <div className="group/tooltip relative font-light text-sm capitalize">
      <TooltipButton
        className={`${borderColor} xl:min-h-9 min-h-8 min-w-24 px-2 border rounded-lg transition-all`}
      >
        <GiAtomicSlashes className="mr-auto" />
        {pluralize(type, 2)}
      </TooltipButton>
      <NavbarHoverTooltip borderColor={borderColor}>
        {CLIP_TYPES.map((t) => (
          <button
            key={t}
            className={classNames(
              "w-full px-2 rounded capitalize text-start",
              typeBackground[type],
              type === t ? "ring-1 ring-indigo-300/50 bg-indigo-300/20" : ""
            )}
            onClick={() => dispatch(setTimelineType({ data: t }))}
          >
            {pluralize(t, 2)}
          </button>
        ))}
      </NavbarHoverTooltip>
    </div>
  );
};

const typeBackground = {
  pattern: "hover:bg-emerald-400/50",
  pose: "hover:bg-fuchsia-400/50",
  scale: "hover:bg-sky-400/50",
};
