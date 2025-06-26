import { NavbarTooltipButton } from "components/TooltipButton";
import { WaterTreeHotkey, WaterTreeIcon } from "lib/hotkeys/timeline";
import { useAppDispatch } from "hooks/useRedux";
import { growTree } from "types/Timeline/TimelineThunks";
import classNames from "classnames";

export const NavbarWaterTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-sky-900/70 to-sky-500/70 border border-sky-500 hover:ring-2 hover:ring-slate-300 p-1"
      )}
      borderColor="border-sky-400/80"
      onClick={() => dispatch(growTree())}
      hotkey={WaterTreeHotkey}
      label={
        <>
          Develop Project
          <br />
          <span className="text-gray-400 text-xs normal-case">
            Press <span className="uppercase">{WaterTreeHotkey.shortcut}</span>{" "}
            to develop a pattern
          </span>
          <br />
          <span className="text-gray-400 text-xs normal-case">
            Press B to customize growth
          </span>
        </>
      }
    >
      <WaterTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
