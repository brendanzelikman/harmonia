import { ToolkitClipButton } from "./Toolkit/ClipButton";
import { ToolkitTransposeButton } from "./Toolkit/TransposeButton";
import { ToolkitKeypad } from "./Toolkit/Keypad";
import { ToolkitPatternButton } from "./Toolkit/PatternButton";
import { ToolkitSliceButton } from "./Toolkit/SliceButton";
import { ToolkitMergeButton } from "./Toolkit/MergeButton";
import { ToolkitPortalButton } from "./Toolkit/PortalButton";

export function NavbarToolkit() {
  return (
    <>
      <div className="flex items-center space-x-2">
        <ToolkitPatternButton />
        <ToolkitClipButton />
        <ToolkitTransposeButton />
        <ToolkitPortalButton />
        <ToolkitSliceButton />
        <ToolkitMergeButton />
      </div>
      <div className="ml-3">
        <ToolkitKeypad />
      </div>
    </>
  );
}
