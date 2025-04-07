import { useStore, useDispatch } from "types/hooks";
import { GiPortal } from "react-icons/gi";
import classNames from "classnames";
import {
  selectHasPortalFragment,
  selectIsAddingPortals,
} from "types/Timeline/TimelineSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { ARRANGE_PORTALS_HOTKEY } from "pages/Playground/hotkeys/useTimelineHotkeys";

export const NavbarPortalGun = () => {
  const dispatch = useDispatch();
  const isPortaling = useStore(selectIsAddingPortals);
  const hasFragment = useStore(selectHasPortalFragment);
  return (
    <div className="relative">
      <NavbarTooltipButton
        keepTooltipOnClick
        label={
          <span>
            {isPortaling
              ? hasFragment
                ? "Place Exit Portal"
                : "Place Entry Portal"
              : "Create Portal"}
            {!isPortaling ? (
              <span className="text-slate-400 font-light">
                {" "}
                ({dispatch(ARRANGE_PORTALS_HOTKEY).shortcut})
              </span>
            ) : (
              ""
            )}
          </span>
        }
        borderColor={
          isPortaling
            ? hasFragment
              ? "border-orange-500"
              : "border-blue-500"
            : "border-indigo-400"
        }
        className={classNames(
          "p-1.5 transition-all text-2xl border-slate-400/50",
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
    </div>
  );
};
