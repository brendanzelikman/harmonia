import { BsScissors } from "react-icons/bs";
import { use, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { selectIsSlicingClips } from "types/Timeline/TimelineSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { NavbarTooltip } from "features/Navbar/components/NavbarTooltip";

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
            {isSlicing ? "Equipped" : "Equip"} Scissors{" "}
            <span className="font-light text-slate-400">(Slice Clips)</span>
          </>
        }
        onClick={() => dispatch(toggleTimelineState({ data: "slicing-clips" }))}
        className={classNames(
          `p-1.5 bg-gradient-radial from-purple-400/20 to-purple-600/80 border-slate-400/50`,
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
        content="Click A Clip To Slice"
        className={"left-[-3rem] bg-purple-500/40 px-2 backdrop-blur"}
      />
    </div>
  );
};
