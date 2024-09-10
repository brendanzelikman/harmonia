import { useProjectDispatch, useDeep } from "types/hooks";
import { useState } from "react";
import { GiShakingHands } from "react-icons/gi";
import { selectSelectedPatternClips } from "types/Timeline/TimelineSelectors";
import { mergeSelectedMedia } from "types/Media/MediaThunks";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarFormButton,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

export const NavbarMergeClipsButton = () => {
  const dispatch = useProjectDispatch();
  const [name, setName] = useState("");
  const selectedClips = useDeep(selectSelectedPatternClips);
  const disabled = !selectedClips.length;

  return (
    <div className="flex flex-col relative group">
      <NavbarTooltipButton
        className={`p-1.5 border-slate-400/50 bg-gradient-to-t from-teal-500/80 to-fuchsia-600/70 ${
          !disabled
            ? "group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-fuchsia-500/50 group-hover:ring-offset-black"
            : ""
        }`}
      >
        <GiShakingHands className="p-0.5" />
      </NavbarTooltipButton>
      <NavbarHoverTooltip
        bgColor="bg-cyan-900/80 backdrop-blur"
        borderColor="border-cyan-500"
        className="group-hover:block hidden left-[-6rem] whitespace-nowrap"
      >
        {disabled ? (
          <div className="flex flex-col h-full justify-center font-normal">
            <p className="text-slate-50">Select 1+ Pattern Clips to Merge</p>
          </div>
        ) : (
          <div className="flex flex-col py-1 w-full h-full justify-center font-normal">
            <div className="pb-2 mb-2 w-full text-center font-bold border-b">
              Merging Pattern Clips
            </div>
            <div className="w-full h-full p-2 space-y-2">
              <NavbarFormGroup>
                <NavbarFormLabel className="mr-4">Name:</NavbarFormLabel>
                <NavbarFormInput
                  className="ring focus:ring-sky-400 ring-slate-400 h-8 w-24"
                  placeholder="New Pattern"
                  value={!selectedClips.length ? "N/A" : name}
                  disabled={!selectedClips.length}
                  onChange={(e) => setName(e.target.value)}
                />
              </NavbarFormGroup>
              <NavbarFormGroup className="pt-2">
                <NavbarFormButton
                  className={`px-3 ${
                    disabled
                      ? "opacity-50 cursor-default"
                      : "opacity-100 cursor-pointer bg-slate-800/20 active:bg-slate-900/50"
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
