import { NavbarButton } from "../components";
import { ToolkitClipButton } from "./ClipButton";
import { ToolkitTransposeButton } from "./TransposeButton";
import { ToolkitKeypad } from "./Keypad";
import { ToolkitPatternButton } from "./PatternButton";
import { ToolkitSliceButton } from "./SliceButton";
import { ToolkitMergeButton } from "./MergeButton";
import { ToolkitPortalButton } from "./PortalButton";

export const ControlButton = (props: {
  className?: string;
  children: any;
  onClick?: () => void;
  label?: string;
}) => (
  <NavbarButton
    {...props}
    className={`border border-slate-400/80 rounded-full flex flex-col justify-center items-center w-9 h-9 text-2xl whitespace-nowrap ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </NavbarButton>
);

export function NavbarToolkit() {
  return (
    <>
      <div className="flex items-center space-x-2">
        <ToolkitPatternButton />
        <ToolkitClipButton />
        <ToolkitTransposeButton />
        <ToolkitSliceButton />
        <ToolkitPortalButton />
        <ToolkitMergeButton />
      </div>
      <div className="ml-3">
        <ToolkitKeypad />
      </div>
    </>
  );
}
