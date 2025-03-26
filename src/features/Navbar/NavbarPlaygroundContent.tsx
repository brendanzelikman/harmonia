import { NavbarGroup } from "./components/NavbarGroup";
import { NavbarProjectMenu } from "./sections/Project/NavbarProject";
import { NavbarLivePlay } from "./sections/Toolkit/NavbarLivePlay";
import { NavbarSettings } from "./sections/Project/NavbarSettings";
import { NavbarPortalGun } from "./sections/Toolkit/NavbarPortalGun";
import { NavbarScissors } from "./sections/Toolkit/NavbarScissors";
import { NavbarTime } from "./sections/Transport/NavbarTime";
import { NavbarTransportControl } from "./sections/Transport/NavbarTransportControl";
import { NavbarVolume } from "./sections/Transport/NavbarVolume";
import { NavbarRedo, NavbarUndo } from "./sections/Project/NavbarUndoRedo";
import { useDeep } from "types/hooks";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { NavbarDesignTree } from "./sections/Toolkit/NavbarDesignTree";
import { NavbarWaterTree } from "./sections/Toolkit/NavbarWaterTree";
import { NavbarArrangeClip } from "./sections/Toolkit/NavbarArrangeClip";

export function NavbarPlaygroundContent() {
  const hasTracks = useDeep(selectHasTracks);
  return (
    <div className="size-full flex animate-in fade-in slide-in-from-top-4 text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
      <NavbarGroup>
        <NavbarProjectMenu />
        <NavbarSettings />
        <NavbarLivePlay />
        <NavbarUndo />
        <NavbarRedo />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-950/30 border-l border-l-slate-500/50">
        <NavbarVolume />
        <NavbarTime />
        <NavbarTransportControl />
      </NavbarGroup>
      <NavbarGroup className="bg-gradient-radial from-sky-500/15 to-fuchsia-500/15">
        Trees:
        <NavbarDesignTree />
        <NavbarArrangeClip type="pattern" />
        <NavbarArrangeClip type="pose" />
      </NavbarGroup>
      <NavbarGroup
        hide={!hasTracks}
        className="bg-gradient-radial from-sky-500/15 to-fuchsia-500/15"
      >
        Tools:
        <NavbarWaterTree />
        <NavbarScissors />
        {/* <NavbarTape /> */}
        <NavbarPortalGun />
      </NavbarGroup>
    </div>
  );
}
