import { NavbarPatternClipButton } from "./Toolkit/NavbarPatternClipButton";
import { NavbarLivePlayButton } from "./Toolkit/NavbarLivePlayButton";
import { NavbarPatternEditorButton } from "./Toolkit/NavbarPatternEditorButton";
import { NavbarSliceClipButton } from "./Toolkit/NavbarSliceClipButton";
import { NavbarMergeClipsButton } from "./Toolkit/NavbarMergeClipsButton";
import { NavbarPortalButton } from "./Toolkit/NavbarPortalButton";
import { NavbarPoseEditorButton } from "./Toolkit/NavbarPoseEditorButton";
import { NavbarPatternListbox } from "./Toolkit/NavbarPatternListbox";
import { NavbarPoseListbox } from "./Toolkit/NavbarPoseListbox";
import { NavbarPoseClipButton } from "./Toolkit/NavbarPoseClipButton";
import { NavbarClipTypeButton } from "./Toolkit/NavbarClipTypeButton";
import { useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/Timeline";
import { NavbarGroup } from "./components";
import { useSubscription } from "providers/subscription";

export function NavbarToolkit() {
  const { isAtLeastStatus } = useSubscription();
  const timeline = useProjectSelector(selectTimeline);
  const onPatterns = timeline.selectedClipType === "pattern";

  const Clipkit = () => {
    return (
      <div
        className={`gap-2 flex items-center px-2 border-x border-x-slate-500/50`}
      >
        {onPatterns ? (
          <>
            <NavbarClipTypeButton />
            <NavbarPatternListbox />
            <NavbarPatternEditorButton />
            <NavbarPatternClipButton />
          </>
        ) : (
          <>
            <NavbarClipTypeButton />
            <NavbarPoseListbox />
            <NavbarPoseEditorButton />
            <NavbarPoseClipButton />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-2 [&>*]:h-full [&>*]:my-auto">
      <Clipkit />
      <NavbarGroup className="gap-2 flex justify-center items-center">
        <NavbarSliceClipButton />
        <NavbarMergeClipsButton />
        <NavbarPortalButton />
        {isAtLeastStatus("maestro") && <NavbarLivePlayButton />}
      </NavbarGroup>
    </div>
  );
}
