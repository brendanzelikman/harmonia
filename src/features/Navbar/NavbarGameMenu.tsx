import { ComponentProps } from "react";
import { GiDrum, GiJackPlug } from "react-icons/gi";
import classNames from "classnames";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import {
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import {
  addPosesToGame,
  promptUserForGameCommand,
} from "types/Game/GameThunks";
import { resetGame } from "types/Game/GameSlice";
import { selectCanGame, selectHasGame } from "types/Game/GameSelectors";
import { BsEraser } from "react-icons/bs";
import {
  AddCommandToGameHotkey,
  AddPosesToGameHotkey,
  ArrangePoseIcon,
  ResetGameHotkey,
} from "lib/hotkeys/timeline";
import { getHotkeyShortcut } from "lib/hotkeys";
import { startTransport } from "types/Transport/TransportState";

export function NavbarGameMenu() {
  const dispatch = useAppDispatch();
  const hasGame = useAppValue(selectHasGame);
  const canGame = useAppValue(selectCanGame);
  return (
    <div className="group/tooltip relative shrink-0">
      {/* Button */}
      <div
        className={classNames(
          hasGame ? "bg-fuchsia-800/50" : "",
          "rounded-full size-9 total-center border border-fuchsia-400 p-1.5"
        )}
      >
        <GiDrum className="size-full shrink-0 text-2xl select-none cursor-pointer group-hover/tooltip:text-fuchsia-500" />
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip
        borderColor="border-fuchsia-500"
        top="top-8"
        bgColor="bg-radial from-slate-900 to-zinc-900 -left-8"
      >
        <div className="size-full min-w-60 space-y-1">
          <div className="text-xl p-2 pb-0">Keyboard Challenges</div>
          <div className="text-base p-2 pt-0 text-fuchsia-300/80">
            Gesture-Based Rhythm Games
          </div>
          <div className="p-2 border border-slate-600 rounded text-slate-300 text-xs">
            A Keyboard Challenge is a set of hotkeys scheduled to be shown
            during playback.
          </div>
          <NavbarGameGroup
            disabled={!canGame}
            onClick={() => dispatch(addPosesToGame())}
          >
            <NavbarGameLabel>
              {!canGame ? "Select Poses for Game" : "Add Poses to Game"}
            </NavbarGameLabel>
            <ArrangePoseIcon className="ml-auto text-2xl" />
          </NavbarGameGroup>
          <div className="text-xs p-2 text-slate-300">
            Add poses to the game by selecting the clips and pressing{" "}
            {getHotkeyShortcut(AddPosesToGameHotkey)}.
          </div>

          <NavbarGameGroup
            disabled={!hasGame}
            onClick={() => dispatch(promptUserForGameCommand())}
          >
            <NavbarGameLabel>Add Gesture to Game</NavbarGameLabel>
            <GiJackPlug className="ml-auto text-2xl" />
          </NavbarGameGroup>
          <div className="text-xs p-2 text-slate-300">
            Add custom hotkeys (based on a gesture) by pressing{" "}
            {getHotkeyShortcut(AddCommandToGameHotkey)}.
          </div>

          {!!hasGame && (
            <>
              <NavbarGameGroup onClick={() => dispatch(startTransport())}>
                <NavbarGameLabel>Start Game</NavbarGameLabel>
                <BsEraser className="ml-auto text-2xl" />
              </NavbarGameGroup>
              <div className="text-xs p-2 text-slate-300">
                Play the game by selecting the displayed track and pressing
                Space.
              </div>
            </>
          )}

          {!!hasGame && (
            <>
              <NavbarGameGroup onClick={() => dispatch(resetGame())}>
                <NavbarGameLabel>Clear Game</NavbarGameLabel>
                <BsEraser className="ml-auto text-2xl" />
              </NavbarGameGroup>
              <div className="text-xs p-2 text-slate-300">
                Remove all commands from the game by pressing{" "}
                {getHotkeyShortcut(ResetGameHotkey)}.
              </div>
            </>
          )}
        </div>
      </NavbarHoverTooltip>
    </div>
  );
}

function NavbarGameGroup(
  props: ComponentProps<typeof NavbarFormGroup> & { disabled?: boolean }
) {
  return (
    <NavbarFormGroup
      {...props}
      className={classNames(
        !props.disabled
          ? "hover:bg-fuchsia-500/25 cursor-pointer"
          : "opacity-70",
        "px-2 h-8 space-x-4",
        props.className
      )}
    />
  );
}

function NavbarGameLabel({ children }: { children: React.ReactNode }) {
  return (
    <NavbarFormLabel className="hover:opacity-95 active:opacity-100 whitespace-nowrap">
      {children}
    </NavbarFormLabel>
  );
}
