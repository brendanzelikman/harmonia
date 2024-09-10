import { NavbarGroup } from "./components/NavbarGroup";
import { NavbarDiaryButton } from "./sections/Project/NavbarDiaryButton";
import { NavbarFileMenu } from "./sections/Project/NavbarFileMenu";
import { NavbarLivePlayButton } from "./sections/Project/NavbarLivePlayButton";
import { NavbarSettingsMenu } from "./sections/Project/NavbarSettingsMenu";
import { NavbarArranger } from "./sections/Toolkit/NavbarArranger";
import { NavbarCreator } from "./sections/Motifs/NavbarCreator";
import { NavbarMotifbox } from "./sections/Motifs/NavbarMotifbox";
import { NavbarPencil } from "./sections/Motifs/NavbarPencil";
import { NavbarPortalGun } from "./sections/Toolkit/NavbarPortalGun";
import { NavbarScissors } from "./sections/Toolkit/NavbarScissors";
import { NavbarTypeBox } from "./sections/Motifs/NavbarTypeBox";
import { NavbarTypeInfoButton } from "./sections/Motifs/NavbarTypeInfo";
import { NavbarTime } from "./sections/Transport/NavbarTime";
import { NavbarTransportControl } from "./sections/Transport/NavbarTransportControl";
import { NavbarVolume } from "./sections/Transport/NavbarVolume";
import { NavbarRedo, NavbarUndo } from "./sections/Project/NavbarUndoRedo";

export function NavbarPlaygroundContent() {
  return (
    <div className="size-full flex text-slate-50">
      <NavbarGroup>
        <NavbarFileMenu />
        <NavbarSettingsMenu />
        <NavbarDiaryButton />
        <NavbarLivePlayButton />
        <NavbarUndo />
        <NavbarRedo />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-950/80 border-l border-l-slate-500/50">
        <NavbarVolume />
        <NavbarTime />
        <NavbarTransportControl />
      </NavbarGroup>
      <NavbarGroup useTypeBackground className="border-x border-x-slate-500/50">
        <NavbarTypeBox />
        <NavbarCreator />
        <NavbarMotifbox />
        <NavbarPencil />
        <NavbarTypeInfoButton />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-500/10 border-r border-r-slate-500/50">
        <NavbarArranger type="pattern" />
        <NavbarArranger type="scale" />
        <NavbarArranger type="pose" />
        <NavbarScissors />
        <NavbarPortalGun />
      </NavbarGroup>
    </div>
  );
}
