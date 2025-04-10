import { useDispatch, useSelect } from "hooks/useStore";
import { selectSelectedPatternClips } from "types/Timeline/TimelineSelectors";
import { mergeSelectedMedia } from "types/Media/MediaThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { FaTape } from "react-icons/fa";
import { MergeClipsHotkey } from "lib/hotkeys/timeline";

export const NavbarTape = () => {
  const dispatch = useDispatch();
  const disabled = useSelect(selectSelectedPatternClips).length < 2;
  return (
    <div className="flex flex-col relative group/tooltip">
      <NavbarTooltipButton
        keepTooltipOnClick
        notClickable={disabled}
        borderColor="border-teal-500"
        className={`p-1.5 border-teal-400/50 hover:ring-[2px] duration-200 hover:ring-slate-300 bg-gradient-to-br from-emerald-400/80 to-emerald-700 ${
          !disabled
            ? "group-hover/tooltip:ring-2 group-hover:ring-offset-2 group-hover/tooltip:ring-teal-500/50 group-hover/tooltip:ring-offset-black"
            : "opacity-50"
        }`}
        label={disabled ? "Select Patterns to Tape" : undefined}
        hotkey={MergeClipsHotkey}
        onClick={() => dispatch(mergeSelectedMedia())}
      >
        <FaTape className="p-0.5 text-2xl" />
      </NavbarTooltipButton>
    </div>
  );
};
