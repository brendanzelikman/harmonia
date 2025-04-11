import { BsScissors } from "react-icons/bs";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import classNames from "classnames";
import { selectIsSlicingClips } from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { ToggleScissorsHotkey } from "lib/hotkeys/timeline";

export const NavbarScissors = () => {
  const dispatch = useAppDispatch();
  const hasClips = useAppValue(selectHasClips);
  const isSlicing = useAppValue(selectIsSlicingClips);
  return (
    <div className="relative">
      <NavbarTooltipButton
        keepTooltipOnClick
        notClickable={!hasClips}
        borderColor="border-teal-500"
        activeLabel="Equipped Scissors"
        label={hasClips ? undefined : "No Patterns to Slice"}
        hotkey={ToggleScissorsHotkey}
        onClick={() =>
          hasClips && dispatch(toggleTimelineState({ data: "slicing-clips" }))
        }
        className={classNames(
          `p-1.5 text-2xl bg-gradient-to-br from-teal-600 to-teal-700`,
          !hasClips ? "opacity-50" : "",
          isSlicing
            ? "ring-2 ring-offset-2 ring-teal-600/80 ring-offset-slate-900"
            : ""
        )}
      >
        <BsScissors />
      </NavbarTooltipButton>
    </div>
  );
};
