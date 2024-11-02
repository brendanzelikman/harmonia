import { NavbarGroup } from "./components/NavbarGroup";
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
import { use } from "types/hooks";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState } from "react";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { NavbarMergeClipsButton } from "./sections/Toolkit/NavbarMerger";

export function NavbarPlaygroundContent() {
  const [isReady, setIsReady] = useState(false);
  useCustomEventListener("timelineReady", (e) => setIsReady(e.detail));
  const hasTracks = use(selectHasTracks);
  const hasClips = use(selectHasClips);
  return (
    <div className="size-full flex text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
      <NavbarGroup>
        <NavbarFileMenu />
        <NavbarSettingsMenu />
        <NavbarUndo />
        <NavbarRedo />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-950/30 border-l border-l-slate-500/50">
        <NavbarVolume />
        <NavbarTime />
        <NavbarTransportControl />
      </NavbarGroup>
      <NavbarGroup
        hide={!hasTracks && !isReady}
        className="bg-slate-500/10 border-r border-r-slate-500/50"
      >
        <NavbarRadio />
        <NavbarCassette />
        <NavbarLivePlayButton />
      </NavbarGroup>
      <NavbarGroup
        hide={!hasTracks}
        useTypeBackground
        className="bg-slate-500/10 border-r border-r-slate-500/50"
      >
        <NavbarArranger type="scale" />
        <NavbarArranger type="pattern" />
        <NavbarArranger type="pose" />
      </NavbarGroup>
      <NavbarGroup
        hide={!hasTracks || !hasClips}
        className="bg-gradient-radial from-slate-500/30 to-slate-500/5"
      >
        <NavbarScissors />
        <NavbarMergeClipsButton />
        <NavbarPortalGun />
      </NavbarGroup>
    </div>
  );
}
