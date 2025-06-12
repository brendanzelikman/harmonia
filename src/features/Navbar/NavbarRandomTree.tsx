import { NavbarTooltipButton } from "components/TooltipButton";
import { GiDiceEightFacesEight, GiDiceTwentyFacesOne } from "react-icons/gi";
import { useAppDispatch } from "hooks/useRedux";
import classNames from "classnames";
import { createRandomTree } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  CreateRandomTreeHotkey,
  CreateRandomTreeIcon,
} from "lib/hotkeys/track";

export const NavbarRandomTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-fuchsia-900/70 to-fuchsia-500/70 border border-fuchsia-500 hover:ring-2 hover:ring-slate-300 p-1"
      )}
      borderColor="border-fuchsia-400/80"
      onClick={() => dispatch(createRandomTree())}
      hotkey={CreateRandomTreeHotkey}
    >
      <CreateRandomTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
