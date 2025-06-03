import { BsScissors } from "react-icons/bs";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import classNames from "classnames";
import {
  selectIsSelectingPatternClips,
  selectIsSlicingClips,
} from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { SliceClipsHotkey, ToggleScissorsHotkey } from "lib/hotkeys/timeline";
import { sliceClips } from "types/Timeline/thunks/TimelineClipThunks";

export const NavbarScissors = () => {
  const dispatch = useAppDispatch();
  const hasClips = useAppValue(selectHasClips);
  const isSelectingClips = useAppValue(selectIsSelectingPatternClips);
  const isSlicing = useAppValue(selectIsSlicingClips);
  return (
    <div className="relative">
      <NavbarTooltipButton
        keepTooltipOnClick
        notClickable={!hasClips}
        borderColor="border-emerald-500"
        activeLabel="Equipped Scissors"
        label={
          isSlicing ? (
            <span>
              Hide Scissors{" "}
              <span className="text-gray-400">
                ({ToggleScissorsHotkey.shortcut})
              </span>
            </span>
          ) : hasClips ? (
            isSelectingClips ? (
              <span>
                Slice Clips{" "}
                <span className="text-gray-400">
                  ({SliceClipsHotkey.shortcut})
                </span>
              </span>
            ) : (
              <span>
                Equip Scissors{" "}
                <span className="text-gray-400">
                  ({ToggleScissorsHotkey.shortcut})
                </span>
              </span>
            )
          ) : (
            "No Clips to Slice"
          )
        }
        hotkey={ToggleScissorsHotkey}
        onClick={() =>
          hasClips
            ? isSelectingClips
              ? dispatch(sliceClips())
              : dispatch(toggleTimelineState({ data: "slicing-clips" }))
            : null
        }
        className={classNames(
          `p-1.5 text-2xl bg-gradient-to-br from-emerald-600 to-emerald-700`,
          !hasClips ? "opacity-50" : "",
          isSlicing
            ? "ring-2 ring-offset-2 ring-emerald-600/80 ring-offset-slate-900"
            : ""
        )}
      >
        <BsScissors />
      </NavbarTooltipButton>
    </div>
  );
};
