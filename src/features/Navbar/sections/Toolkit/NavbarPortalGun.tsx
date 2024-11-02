import { use, useProjectDispatch } from "types/hooks";
import { GiPortal } from "react-icons/gi";
import classNames from "classnames";
import {
  selectHasPortalFragment,
  selectIsAddingPortals,
} from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { NavbarTooltip } from "features/Navbar/components/NavbarTooltip";

export const NavbarPortalGun = () => {
  const dispatch = useProjectDispatch();
  const hasClips = use(selectHasClips);
  const isPortaling = use(selectIsAddingPortals);
  const hasFragment = use(selectHasPortalFragment);

  return (
    <div className="relative">
      <NavbarTooltipButton
        label={
          <>
            {isPortaling ? "Equipped" : "Equip"} Portal Gun{" "}
            <span className="font-light text-slate-400">(Teleport Clips)</span>
          </>
        }
        disabled={!hasClips}
        borderColor="border-blue-500"
        className={classNames(
          "p-1.5 border-slate-400/50",
          !hasClips ? "opacity-50" : "",
          {
            "bg-gradient-to-br from-blue-600 to-orange-500": !isPortaling,
            "ring-2 ring-offset-2 ring-offset-black duration-150": isPortaling,
            "bg-sky-600 ring-sky-600/80": isPortaling && !hasFragment,
            "bg-orange-500 ring-orange-400/80": isPortaling && hasFragment,
          }
        )}
        onClick={() =>
          dispatch(toggleTimelineState({ data: "portaling-clips" }))
        }
      >
        <GiPortal />
      </NavbarTooltipButton>
      <NavbarTooltip
        show={isPortaling}
        content={hasFragment ? "Place an Exit Portal" : "Place an Entry Portal"}
        className={classNames(
          "left-[-3.2rem] px-2 backdrop-blur",
          { "bg-sky-600/80": isPortaling && !hasFragment },
          { "bg-orange-500/80": isPortaling && hasFragment }
        )}
      />
    </div>
  );
};
