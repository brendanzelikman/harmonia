import { NavbarGroup } from "features/Navbar/components";
import { NavbarPortalButton } from "./Arrangement/NavbarPortalButton";
import { NavbarSliceClipButton } from "./Arrangement/NavbarSliceClipButton";
import { NavbarMergeClipsButton } from "./Arrangement/NavbarMergeClipsButton";

export function NavbarArrangementSection() {
  return (
    <NavbarGroup className="bg-slate-500/10 px-2 gap-2 flex justify-center items-center border-r border-r-slate-500/50">
      <NavbarSliceClipButton />
      <NavbarMergeClipsButton />
      <NavbarPortalButton />
    </NavbarGroup>
  );
}
