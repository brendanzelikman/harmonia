import { BsScissors } from "react-icons/bs";
import { useDeep, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { selectIsSlicingClips } from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { SLICE_CLIPS_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";

export const NavbarScissors = () => {
  const dispatch = useProjectDispatch();
  const hasClips = useDeep(selectHasClips);
  const isSlicing = useDeep(selectIsSlicingClips);
  return (
    <div className="relative">
      <NavbarTooltipButton
        keepTooltipOnClick
        notClickable={!hasClips}
        borderColor="border-teal-500"
        activeLabel="Equipped Scissors"
        label={hasClips ? undefined : "No Patterns to Slice"}
        hotkey={dispatch(SLICE_CLIPS_HOTKEY)}
        onClick={() => dispatch(toggleTimelineState({ data: "slicing-clips" }))}
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
