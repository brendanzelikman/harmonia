import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { selectSelectedPatternClips } from "types/Timeline/TimelineSelectors";
import { mergeSelectedMedia } from "types/Media/MediaThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import { FaTape } from "react-icons/fa";
import { MergeClipsHotkey } from "lib/hotkeys/timeline";
import { selectHasClips } from "types/Clip/ClipSelectors";

export const NavbarTape = () => {
  const dispatch = useAppDispatch();
  const hasClips = useAppValue(selectHasClips);
  const disabled = useAppValue(selectSelectedPatternClips).length < 1;
  return (
    <div className="flex flex-col relative group/tooltip">
      <NavbarTooltipButton
        keepTooltipOnClick
        notClickable={disabled}
        borderColor="border-blue-500"
        className={`p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:ring-[2px] duration-200 hover:ring-slate-300 ${
          !disabled
            ? "group-hover/tooltip:ring-2 group-hover:ring-offset-2 group-hover/tooltip:ring-blue-500/50 group-hover/tooltip:ring-offset-black"
            : "opacity-50"
        }`}
        label={
          disabled
            ? hasClips
              ? "Select Clips to Tape"
              : "No Clips to Tape"
            : undefined
        }
        hotkey={MergeClipsHotkey}
        onClick={() => dispatch(mergeSelectedMedia())}
      >
        <FaTape className="p-half text-2xl" />
      </NavbarTooltipButton>
    </div>
  );
};
