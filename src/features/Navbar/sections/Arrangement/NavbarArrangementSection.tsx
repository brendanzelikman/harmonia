import { NavbarGroup } from "features/Navbar/components";
import { NavbarPortalButton } from "./NavbarPortalButton";
import { NavbarSliceClipButton } from "./NavbarSliceClipButton";
import { NavbarUndoRedo } from "./NavbarUndoRedo";
import { NavbarLivePlayButton } from "./NavbarLivePlayButton";

export function NavbarArrangementSection() {
  return (
    <NavbarGroup className="bg-slate-500/10 px-2 gap-2 flex justify-center items-center border-r border-r-slate-500/50">
      <NavbarSliceClipButton />
      {/* <NavbarMergeClipsButton /> */}
      <NavbarPortalButton />
      <NavbarLivePlayButton />
      <NavbarUndoRedo />
    </NavbarGroup>
  );
}
