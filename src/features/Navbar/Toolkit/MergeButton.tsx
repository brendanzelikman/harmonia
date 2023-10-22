import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarFormButton,
  NavbarTooltipMenu,
} from "../components";
import { BsLink45Deg } from "react-icons/bs";
import { ControlButton } from ".";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import {
  selectSelectedClipIds,
  selectSelectedMedia,
  selectTimeline,
} from "redux/selectors";
import { mergeSelectedMedia, toggleMergingMedia } from "redux/thunks";
import { isTimelineMergingMedia } from "types/Timeline";
import { useState } from "react";

export const ToolkitMergeButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isMerging = isTimelineMergingMedia(timeline);
  const selectedClipIds = useProjectDeepSelector(selectSelectedClipIds);
  const selectedMedia = useProjectDeepSelector(selectSelectedMedia);
  const [mergeName, setMergeName] = useState("");

  /** The name of the new pattern obtained by merging */
  const NewPatternName = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="mr-4">Name:</NavbarFormLabel>
      <NavbarFormInput
        className="border-slate-400 h-8 w-24 focus:border-slate-200 focus:bg-purple-800/80"
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
              : "opacity-100 cursor-pointer animate-pulse bg-purple-600"
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
      <ControlButton
        label="Merge Pattern Clips"
        onClick={() => dispatch(toggleMergingMedia())}
        className={`${
          isMerging
            ? "bg-purple-700 ring-2 ring-offset-2 ring-purple-700/80 ring-offset-black"
            : "bg-purple-700/80"
        }`}
      >
        <BsLink45Deg />
      </ControlButton>
    );
  };

  const MergeTooltip = () => {
    return (
      <NavbarTooltip
        className="left-[-6rem] bg-purple-700 min-w-[15rem]"
        show={!!isMerging}
        content={
          <NavbarTooltipMenu>
            <div className="pb-2 mb-2 w-full text-center font-bold border-b">
              Merging Track Media
            </div>
            <div className="w-full h-full p-2 space-y-1">
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
      <MergeButton />
      {MergeTooltip()}
    </div>
  );
};
