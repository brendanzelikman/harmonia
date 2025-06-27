import { ComponentProps } from "react";
import { GiDrum, GiJackPlug, GiMisdirection } from "react-icons/gi";
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
import { BsEraser, BsPlay } from "react-icons/bs";
import {
  AddCommandToGameHotkey,
  AddPosesToGameHotkey,
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
          hasGame ? "bg-indigo-800/50" : "",
          "rounded-full size-9 total-center border border-indigo-400 p-1.5"
        )}
      >
        <GiDrum className="size-full shrink-0 text-2xl select-none cursor-pointer group-hover/tooltip:text-indigo-500" />
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip
        borderColor="border-indigo-500"
        top="top-8"
        bgColor="bg-radial from-slate-900 to-zinc-900 -left-8"
      >
        <div className="size-full min-w-64 space-y-2">
          <div className="text-xl p-2 pb-0">Create Rhythm Games</div>
          <div className="text-base p-2 border-t border-t-fuchsia-500 text-fuchsia-300/80">
            Turn Gestures to Instructions
          </div>

          <div className="border border-slate-500 rounded">
            <NavbarGameGroup
              className="border-b border-b-sky-500"
              disabled={!canGame}
              onClick={() => dispatch(addPosesToGame())}
            >
              <NavbarGameLabel>
                {!canGame ? "Move Along Scales" : "Add Poses to Game"}
              </NavbarGameLabel>
              <GiMisdirection className="ml-auto text-2xl" />
            </NavbarGameGroup>
            <div className="text-xs p-2 text-slate-400">
              Add poses from Move Along Scales by selecting the clips and
              pressing {getHotkeyShortcut(AddPosesToGameHotkey)}.
            </div>
          </div>

          <div className="border border-slate-500 rounded">
            <NavbarGameGroup
              className="border-b border-b-emerald-500"
              disabled={!hasGame}
              onClick={() => dispatch(promptUserForGameCommand())}
            >
              <NavbarGameLabel>Add Gesture to Game</NavbarGameLabel>
              <GiJackPlug className="ml-auto text-2xl" />
            </NavbarGameGroup>
            <div className="text-xs p-2 text-slate-400">
              Add gestures by prompt (any key and value) by pressing{" "}
              {getHotkeyShortcut(AddCommandToGameHotkey)}.
            </div>
          </div>

          {!!hasGame && (
            <div className="border border-slate-500 rounded">
              <NavbarGameGroup
                className="border-b border-b-fuchsia-500"
                onClick={() => dispatch(startTransport())}
              >
                <NavbarGameLabel>Start Game</NavbarGameLabel>
                <BsPlay className="ml-auto text-2xl" />
              </NavbarGameGroup>
              <div className="text-xs p-2 text-slate-400">
                Play the game by selecting the track and pressing Space to start
                the timeline.
              </div>
            </div>
          )}

          {!!hasGame && (
            <div className="border border-slate-500 rounded">
              <NavbarGameGroup
                className="border-b border-b-slate-500"
                onClick={() => dispatch(resetGame())}
              >
                <NavbarGameLabel>Clear Game</NavbarGameLabel>
                <BsEraser className="ml-auto text-2xl" />
              </NavbarGameGroup>
              <div className="text-xs p-2 text-slate-400">
                Remove all instructions from the game by pressing{" "}
                {getHotkeyShortcut(ResetGameHotkey)}.
              </div>
            </div>
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
          ? "hover:bg-indigo-500/25 cursor-pointer"
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
