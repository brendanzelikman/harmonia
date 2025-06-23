import { ComponentProps } from "react";
import { GiDrum, GiJackPlug } from "react-icons/gi";
import classNames from "classnames";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import {
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { addPosesToGame } from "types/Game/GameThunks";
import { addGameActions, resetGame } from "types/Game/GameSlice";
import { selectCanGame, selectHasGame } from "types/Game/GameSelectors";
import { BsEraser } from "react-icons/bs";
import { promptUserForString } from "lib/prompts/html";
import { selectCurrentTimelineTick } from "types/Timeline/TimelineSelectors";
import { ArrangePoseIcon } from "lib/hotkeys/timeline";

export function NavbarGameMenu() {
  const dispatch = useAppDispatch();
  const hasGame = useAppValue(selectHasGame);
  const canGame = useAppValue(selectCanGame);
  const tick = useAppValue(selectCurrentTimelineTick);
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
          <div className="text-xl p-2 pb-0">Rhythm Games</div>
          <div className="text-base p-2 pt-0 text-fuchsia-300/80">
            Press Keys To The Beat
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

          <NavbarGameGroup
            disabled={!hasGame}
            onClick={promptUserForString({
              title: "Add Command to Game",
              description: "Enter a key and a value (e.g. Q5 or M0)",
              callback: (string) => {
                const regex = /^([a-zA-Z0-9]+)(-?\d+)$/;
                if (!regex.test(string)) return;
                const match = string.match(regex);
                if (!match) return;
                const key = match[1]?.toLowerCase();
                const value = parseInt(match[2], 10);
                if (!key || isNaN(value)) return;
                dispatch(
                  addGameActions({ data: { actions: [{ key, value, tick }] } })
                );
              },
            })}
          >
            <NavbarGameLabel>Add Command to Game</NavbarGameLabel>
            <GiJackPlug className="ml-auto text-2xl" />
          </NavbarGameGroup>

          {!!hasGame && (
            <NavbarGameGroup onClick={() => dispatch(resetGame())}>
              <NavbarGameLabel>Delete Game</NavbarGameLabel>
              <BsEraser className="ml-auto text-2xl" />
            </NavbarGameGroup>
          )}

          {!hasGame && (
            <p className="text-xs mt-1 px-1 text-slate-500">
              Poses can only have one scalar offset.
            </p>
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
