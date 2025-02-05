import { BsScissors } from "react-icons/bs";
import { use, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { selectIsSlicingClips } from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { NavbarTooltip } from "features/Navbar/components/NavbarTooltip";
import { SLICE_CLIPS_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";

export const NavbarScissors = () => {
  const dispatch = useProjectDispatch();
  const hasClips = use(selectHasClips);
  const isSlicing = use(selectIsSlicingClips);

  return (
    <div className="relative">
      <NavbarTooltipButton
        disabled={!hasClips}
        label={
          <>
            {isSlicing ? "Hide Scissors" : "Equip Scissors"} (
            {dispatch(SLICE_CLIPS_HOTKEY).shortcut})
          </>
        }
        onClick={() => dispatch(toggleTimelineState({ data: "slicing-clips" }))}
        className={classNames(
          `p-1.5 bg-gradient-radial from-teal-200/40 to-teal-200/10`,
          !hasClips ? "opacity-50" : "",
          isSlicing
            ? "ring-2 ring-offset-2 ring-slate-600/80 ring-offset-slate-900"
            : ""
        )}
      >
        <BsScissors />
      </NavbarTooltipButton>
      <NavbarTooltip
        show={!!isSlicing}
        content="Click Within a Clip to Slice"
        className={"left-[-5rem] bg-slate-500/50 px-2 backdrop-blur"}
      />
    </div>
  );
};
