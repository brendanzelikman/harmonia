import { useEvent } from "hooks/useEvent";
import { useState } from "react";
import { useRoute } from "app/router";
import { NavbarBrand } from "features/Navbar/NavbarBrand";
import { views } from "features/Home/Home";
import { useStore } from "hooks/useStore";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { NavbarGroup } from "./NavbarGroup";
import { NavbarProjectMenu } from "./sections/Project/NavbarProject";
import { NavbarSettings } from "./sections/Project/NavbarSettings";
import { NavbarUndo, NavbarRedo } from "./sections/Project/NavbarUndoRedo";
import { NavbarArrangeClip } from "./sections/Toolkit/NavbarArrangeClip";
import { NavbarDesignTree } from "./sections/Toolkit/NavbarDesignTree";
import { NavbarLivePlay } from "./sections/Toolkit/NavbarLivePlay";
import { NavbarPortalGun } from "./sections/Toolkit/NavbarPortalGun";
import { NavbarScissors } from "./sections/Toolkit/NavbarScissors";
import { NavbarWaterTree } from "./sections/Toolkit/NavbarWaterTree";
import { NavbarTime } from "./sections/Transport/NavbarTime";
import { NavbarTransportControl } from "./sections/Transport/NavbarTransportControl";
import { NavbarVolume } from "./sections/Transport/NavbarVolume";
import { NavbarLink } from "./NavbarLink";
import { LOAD_PLAYGROUND } from "features/Playground/Playground";

export function Navbar() {
  const view = useRoute();
  const hasTracks = useStore(selectHasTracks);

  // Listen for the playground to load
  const [didLoad, setDidLoad] = useState(false);
  useEvent(LOAD_PLAYGROUND, (e) => setDidLoad(e.detail));
  const didPlaygroundLoad = view === "playground" && didLoad;

  // Render the playground if it should be loaded
  return (
    <div className="absolute flex flex-nowrap shrink-0 items-center inset-0 bg-slate-900 border-b-0.5 border-b-slate-700 shadow-xl h-nav px-3 z-[140] transition-all animate-in fade-in text-2xl">
      <NavbarBrand />
      {!didPlaygroundLoad ? (
        <div className="w-full flex gap-4 *:pr-4 *:border-r last:*:border-r-0 *:border-r-slate-600 text-slate-500 justify-end pr-2">
          {views.map((v) => (
            <NavbarLink v={v} key={v} />
          ))}
        </div>
      ) : (
        <div className="size-full select-none flex animate-in fade-in slide-in-from-top-4 text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
          <NavbarGroup className="w-[250px] gap-3">
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
          <NavbarGroup className="bg-gradient-radial from-slate-900/15 to-sky-500/15">
            Motifs <NavbarDesignTree />
            <NavbarArrangeClip type="pattern" />
            <NavbarArrangeClip type="pose" />
          </NavbarGroup>
          <NavbarGroup
            hide={!hasTracks}
            className="bg-gradient-radial from-emerald-600/15 to-teal-600/15"
          >
            Tools <NavbarWaterTree />
            <NavbarScissors />
            <NavbarPortalGun />
          </NavbarGroup>
        </div>
      )}
    </div>
  );
}
