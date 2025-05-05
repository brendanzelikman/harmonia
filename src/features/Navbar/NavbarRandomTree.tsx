import { NavbarTooltipButton } from "components/TooltipButton";
import { GiDiceEightFacesEight, GiPineTree } from "react-icons/gi";
import { useAppDispatch } from "hooks/useRedux";
import classNames from "classnames";
import { createRandomTree } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { CreateRandomTreeHotkey } from "lib/hotkeys/track";

export const NavbarRandomTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-fuchsia-700/70 to-fuchsia-500/70 border border-fuchsia-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      )}
      borderColor="border-fuchsia-400/80"
      onClick={() => dispatch(createRandomTree())}
      hotkey={CreateRandomTreeHotkey}
    >
      <GiDiceEightFacesEight className="text-2xl" />
    </NavbarTooltipButton>
  );
};
