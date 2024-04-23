import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarFormButton,
  NavbarTooltipMenu,
} from "../components";
import { NavbarTooltipButton } from "../../../components/TooltipButton";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import { selectSelectedPatternClipIds, selectTimeline } from "redux/selectors";
import { mergeSelectedMedia, toggleMergingMedia } from "redux/thunks";
import { isTimelineMergingClips } from "types/Timeline";
import { useState } from "react";
import { GiLinkedRings } from "react-icons/gi";

export const NavbarMergeClipsButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isMerging = isTimelineMergingClips(timeline);
  const selectedClipIds = useProjectDeepSelector(selectSelectedPatternClipIds);
  const [mergeName, setMergeName] = useState("");

  /** The name of the new pattern obtained by merging */
  const NewPatternName = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="mr-4">Name:</NavbarFormLabel>
      <NavbarFormInput
        className="ring ring-slate-400 h-8 w-24"
        placeholder="New Pattern"
        value={!selectedClipIds.length ? "N/A" : mergeName}
        disabled={!selectedClipIds.length}
        onChange={(e) => setMergeName(e.target.value)}
      />
    </NavbarFormGroup>
  );

  /** Merge if at least one clip selected */
  const DispatchButton = () => {
    const disabled = !selectedClipIds.length;
    return (
      <NavbarFormGroup className="pt-2">
        <NavbarFormButton
          className={`${
            disabled
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer animate-pulse bg-slate-800/20"
          }`}
          disabled={disabled}
          onClick={() =>
            !disabled && dispatch(mergeSelectedMedia({ name: mergeName }))
          }
        >
          {disabled ? "Select 1+ Clips to Merge" : "Merge Selected Media"}
        </NavbarFormButton>
      </NavbarFormGroup>
    );
  };

  const MergeButton = () => {
    return (
      <NavbarTooltipButton
        label={isMerging ? "Stop Merging Pattern Clips" : "Merge Pattern Clips"}
        onClick={() => dispatch(toggleMergingMedia())}
        className={`border-slate-400/50 bg-gradient-to-t from-teal-500 to-fuchsia-500 ${
          isMerging
            ? "ring-2 ring-offset-2 ring-fuchsia-500/50 ring-offset-black"
            : ""
        }`}
      >
        <GiLinkedRings className="p-0.5" />
      </NavbarTooltipButton>
    );
  };

  const MergeTooltip = () => {
    return (
      <NavbarTooltip
        className="left-[-6rem] bg-gradient-to-t from-teal-500/70 to-fuchsia-500/80  min-w-[15rem]"
        show={!!isMerging}
        content={
          <NavbarTooltipMenu>
            <div className="pb-2 mb-2 w-full text-center font-bold border-b">
              Merging Pattern Clips
            </div>
            <div className="w-full h-full p-2 space-y-2">
              {NewPatternName()}
              <DispatchButton />
            </div>
          </NavbarTooltipMenu>
        }
      />
    );
  };

  return (
    <div className="flex flex-col relative h-full">
      {MergeButton()}
      {MergeTooltip()}
    </div>
  );
};
