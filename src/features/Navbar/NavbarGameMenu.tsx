import {
  GiArrowDunk,
  GiBackForth,
  GiBreakingChain,
  GiBubbles,
  GiDrum,
  GiKeyboard,
  GiMisdirection,
} from "react-icons/gi";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import {
  addPosesToGame,
  promptUserForGameCommand,
  removeGameActionsAtCurrentTick,
} from "types/Game/GameThunks";
import { resetGame } from "types/Game/GameSlice";
import { selectCanGame, selectHasGame } from "types/Game/GameSelectors";
import { BsEraser, BsPlay } from "react-icons/bs";
import {
  _StartGameHotkey,
  AddCommandToGameHotkey,
  AddPosesToGameHotkey,
  RemoveCommandFromGameHotkey,
  ResetGameHotkey,
} from "lib/hotkeys/timeline";
import { startTransport } from "types/Transport/TransportState";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";

export function NavbarGameMenu() {
  const dispatch = useAppDispatch();
  const hasGame = useAppValue(selectHasGame);
  const canGame = useAppValue(selectCanGame);
  return (
    <NavbarActionButton
      title="Gesture - Instructions"
      subtitle="Turn Hotkeys to Live Rhythm Games"
      subtitleClass="text-fuchsia-400"
      Icon={<GiDrum className="text-2xl" />}
      background="bg-radial from-fuchsia-900/70 to-fuchsia-500/70"
      borderColor="border-fuchsia-500"
      minWidth="min-w-68"
    >
      <NavbarActionButtonOption
        title={"Add Poses to Game"}
        Icon={<GiMisdirection className="ml-auto text-2xl" />}
        subtitle={AddPosesToGameHotkey.description}
        stripe="border-b-sky-500"
        onClick={() => dispatch(addPosesToGame())}
        readOnly={!canGame}
      />
      <NavbarActionButtonOption
        title="Add Gesture to Game"
        Icon={<GiKeyboard className="ml-auto text-2xl" />}
        subtitle={AddCommandToGameHotkey.description}
        onClick={() => dispatch(promptUserForGameCommand())}
        stripe="border-b-emerald-500"
      />
      {!!hasGame && (
        <NavbarActionButtonOption
          title="Remove Gesture from Game"
          Icon={<GiArrowDunk className="ml-auto text-2xl" />}
          subtitle={RemoveCommandFromGameHotkey.description}
          onClick={() => dispatch(removeGameActionsAtCurrentTick())}
          stripe="border-b-red-500"
        />
      )}
      {!!hasGame && (
        <NavbarActionButtonOption
          title="Start Game"
          Icon={<BsPlay className="ml-auto text-2xl" />}
          subtitle={_StartGameHotkey.description}
          onClick={() => dispatch(startTransport())}
          stripe="border-b-fuchsia-500"
        />
      )}
      {!!hasGame && (
        <NavbarActionButtonOption
          title="Clear Game"
          Icon={<BsEraser className="ml-auto text-2xl" />}
          subtitle={ResetGameHotkey.description}
          onClick={() => dispatch(resetGame())}
          stripe="border-b-slate-500"
        />
      )}
    </NavbarActionButton>
  );
}
