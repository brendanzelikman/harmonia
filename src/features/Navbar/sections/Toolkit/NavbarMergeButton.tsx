import { useProjectDispatch, use } from "types/hooks";
import { useState } from "react";
import { selectSelectedClips } from "types/Timeline/TimelineSelectors";
import { mergeSelectedMedia } from "types/Media/MediaThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarFormButton,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { FaTape } from "react-icons/fa";

export const NavbarMergeClipsButton = () => {
  const dispatch = useProjectDispatch();
  const [name, setName] = useState("");
  const selectedClips = use(selectSelectedClips);
  const disabled = !selectedClips.length;
  return (
    <div className="flex flex-col relative group/tooltip">
      <NavbarTooltipButton
        disabled={disabled}
        className={`p-1.5 border-slate-400/50 hover:ring-[2px] duration-200 hover:ring-slate-300 bg-gradient-to-tr from-pink-500/20 to-pink-400/60 ${
          !disabled
            ? "group-hover/tooltip:ring-2 group-hover:ring-offset-2 group-hover/tooltip:ring-pink-500/50 group-hover/tooltip:ring-offset-black"
            : ""
        }`}
      >
        <FaTape className="p-0.5" />
      </NavbarTooltipButton>
      <NavbarHoverTooltip
        bgColor="bg-slate-900"
        borderColor="border-pink-400"
        padding="px-2 py-1 rounded-lg"
        className="group-hover/tooltip:block hidden left-[-4rem] whitespace-nowrap"
      >
        {disabled ? (
          <div className="total-center h-full whitespace-nowrap text-slate-200">
            Select Clips to Merge
          </div>
        ) : (
          <div className="flex flex-col py-1 w-full h-full justify-center">
            <div className="pb-2 mb-2 w-full text-center border-b">
              Equipped Tape
            </div>
            <div className="w-full h-full p-2 space-y-2">
              <NavbarFormGroup>
                <NavbarFormLabel className="mr-4">Name:</NavbarFormLabel>
                <NavbarFormInput
                  className="ring bg-slate-500/5 focus:ring-sky-500 ring-slate-400 h-8 w-24"
                  placeholder="New Pattern"
                  value={!selectedClips.length ? "N/A" : name}
                  disabled={!selectedClips.length}
                  onChange={(e) => setName(e.target.value)}
                />
              </NavbarFormGroup>
              <NavbarFormGroup className="pt-2">
                <NavbarFormButton
                  className={`px-3 bg-white/5 ${
                    disabled
                      ? "opacity-50 cursor-default"
                      : "opacity-100 cursor-pointer active:opacity-80"
                  }`}
                  disabled={disabled}
                  onClick={() =>
                    !disabled && dispatch(mergeSelectedMedia({ name: name }))
                  }
                >
                  {disabled
                    ? "Select 1+ Clips to Merge"
                    : "Merge Selected Media"}
                </NavbarFormButton>
              </NavbarFormGroup>
            </div>
          </div>
        )}
      </NavbarHoverTooltip>
    </div>
  );
};
