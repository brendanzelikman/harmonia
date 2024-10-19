import { NavbarGroup } from "./components/NavbarGroup";
import { NavbarDiaryButton } from "./sections/Project/NavbarDiaryButton";
import { NavbarFileMenu } from "./sections/Project/NavbarFileMenu";
import { NavbarLivePlayButton } from "./sections/Project/NavbarLivePlayButton";
import { NavbarSettingsMenu } from "./sections/Project/NavbarSettingsMenu";
import { NavbarArranger } from "./sections/Toolkit/NavbarArranger";
import { NavbarPortalGun } from "./sections/Toolkit/NavbarPortalGun";
import { NavbarScissors } from "./sections/Toolkit/NavbarScissors";
import { NavbarTime } from "./sections/Transport/NavbarTime";
import { NavbarTransportControl } from "./sections/Transport/NavbarTransportControl";
import { NavbarVolume } from "./sections/Transport/NavbarVolume";
import { NavbarRedo, NavbarUndo } from "./sections/Project/NavbarUndoRedo";
import { NavbarRadio } from "./sections/Toolkit/NavbarRadio";
import { NavbarCassette } from "./sections/Toolkit/NavbarCassette";
import { NavbarTerminalButton } from "./sections/Project/NavbarTerminalButton";

export function NavbarPlaygroundContent() {
  return (
    <div className="size-full flex text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
      <NavbarGroup>
        <NavbarFileMenu />
        <NavbarSettingsMenu />
        <NavbarDiaryButton />
        <NavbarTerminalButton />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-950/30 border-l border-l-slate-500/50">
        <NavbarVolume />
        <NavbarTime />
        <NavbarTransportControl />
      </NavbarGroup>

      <NavbarGroup
        useTypeBackground
        className="bg-slate-500/10 border-r border-r-slate-500/50"
      >
        <NavbarArranger type="scale" />
        <NavbarArranger type="pattern" />
        <NavbarArranger type="pose" />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-500/10 border-r border-r-slate-500/50">
        <NavbarRadio />
        <NavbarCassette />
        <NavbarLivePlayButton />
      </NavbarGroup>
      <NavbarGroup className="bg-gradient-radial from-slate-500/30 to-slate-500/5">
        <NavbarScissors />
        <NavbarPortalGun />
        <NavbarUndo />
        <NavbarRedo />
      </NavbarGroup>
    </div>
  );
}
