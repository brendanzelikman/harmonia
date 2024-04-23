import { NavbarArrangeClipButton } from "./Toolkit/NavbarArrangeClipButton";
import { NavbarLivePlayButton } from "./Toolkit/NavbarLivePlayButton";
import { NavbarToggleEditorButton } from "./Toolkit/NavbarToggleEditorButton";
import { NavbarSliceClipButton } from "./Toolkit/NavbarSliceClipButton";
import { NavbarMergeClipsButton } from "./Toolkit/NavbarMergeClipsButton";
import { NavbarPortalButton } from "./Toolkit/NavbarPortalButton";
import { NavbarPatternListbox } from "./Toolkit/NavbarPatternListbox";
import { NavbarPoseListbox } from "./Toolkit/NavbarPoseListbox";
import { NavbarClipTypeButton } from "./Toolkit/NavbarClipTypeButton";
import { useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/Timeline";
import { NavbarGroup } from "./components";
import { NavbarAddClipButton } from "./Toolkit/NavbarAddClipButton";

export function NavbarToolkit() {
  const timeline = useProjectSelector(selectTimeline);
  const onPatterns = timeline.selectedClipType === "pattern";

  return (
    <div className="flex gap-2 [&>*]:h-full [&>*]:my-auto">
      <div
        className={`gap-2 flex items-center px-2 border-x border-x-slate-500/50`}
      >
        <NavbarAddClipButton />
        <NavbarClipTypeButton />
        {onPatterns ? <NavbarPatternListbox /> : <NavbarPoseListbox />}
        <NavbarToggleEditorButton />
        <NavbarArrangeClipButton />
      </div>
      <NavbarGroup className="gap-2 flex justify-center items-center">
        <NavbarSliceClipButton />
        <NavbarMergeClipsButton />
        <NavbarPortalButton />
        <NavbarLivePlayButton />
      </NavbarGroup>
    </div>
  );
}
