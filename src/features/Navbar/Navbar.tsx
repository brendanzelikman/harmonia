import { SPLASH } from "app/router";
import { NavbarBrand } from "features/Navbar/components/NavbarBrand";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { NavbarGroup, NavbarGroupLabel } from "./components/NavbarGroup";
import { NavbarProjectMenu } from "./NavbarProject";
import { NavbarUndo, NavbarRedo } from "./NavbarUndoRedo";
import { NavbarArrangePatterns, NavbarArrangePoses } from "./NavbarArrangeClip";
import { NavbarCreateTree } from "./NavbarCreateTree";
import { NavbarLivePlay } from "./NavbarLivePlay";
import { NavbarPortalGun } from "./NavbarPortalGun";
import { NavbarScissors } from "./NavbarScissors";
import { NavbarTime } from "./NavbarTime";
import { NavbarVolume } from "./NavbarVolume";
import { NavbarLink } from "./components/NavbarLink";
import { NavbarSettings } from "./NavbarSettings";
import { NavbarTape } from "./NavbarTape";
import { useLocation } from "react-router-dom";
import { NavbarGameMenu } from "./NavbarGameMenu";
import { NavbarMixPlay } from "./NavbarMixPlay";
import { NavbarLeadPlay } from "./NavbarLeadPlay";
import {
  NavbarLoopTransport,
  NavbarRecordTransport,
  NavbarStopTransport,
  NavbarToggleTransport,
} from "./NavbarTransportControl";
import { useGestures } from "lib/gestures";

export function Navbar() {
  const { pathname } = useLocation();
  const hasTracks = useAppValue(selectHasTracks);
  const onSplash = pathname === SPLASH;
  return (
    <nav className="absolute flex flex-nowrap shrink-0 items-center inset-0 bg-slate-900 border-b-[1px] border-b-slate-700 shadow-xl h-nav px-3 z-[300] transition-all animate-in fade-in text-2xl">
      <NavbarBrand />
      {onSplash ? (
        <div className="w-full flex gap-4 *:pr-4 *:border-r last:*:border-r-0 *:border-r-slate-600 text-slate-500 justify-end pr-2">
          <NavbarLink v="/calculator" />
        </div>
      ) : (
        <div className="size-full select-none flex animate-in fade-in slide-in-from-top-4 text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
          <NavbarGroup
            gap="gap-1"
            className="pl-3 ml-3 border-l border-l-slate-500/50"
          >
            <NavbarProjectMenu />
            <NavbarSettings />
            <NavbarUndo />
            <NavbarRedo />
          </NavbarGroup>
          <NavbarGroup className="bg-radial from-slate-900/15 to-teal-800/15">
            <NavbarVolume />
            <NavbarTime />
            <div className="flex gap-1.5">
              <NavbarStopTransport />
              <NavbarToggleTransport />
              <NavbarRecordTransport />
              <NavbarLoopTransport />
            </div>
          </NavbarGroup>
          <NavbarGroup className="bg-radial from-slate-900/15 to-sky-500/15">
            <NavbarGroupLabel>Motifs</NavbarGroupLabel>
            <NavbarCreateTree />
            <NavbarArrangePatterns />
            <NavbarArrangePoses />
          </NavbarGroup>
          <NavbarGroup
            hide={!hasTracks}
            className="bg-radial from-teal-800/15 to-teal-600/15"
          >
            <NavbarGroupLabel>Clips</NavbarGroupLabel>
            <NavbarTape />
            <NavbarScissors />
            <NavbarPortalGun />
          </NavbarGroup>
          <NavbarGroup
            hide={!hasTracks}
            className="bg-radial from-teal-800/15 to-teal-600/15"
          >
            <NavbarGestureLabel />
            <NavbarLivePlay />
            <NavbarLeadPlay />
            <NavbarMixPlay />
            <NavbarGameMenu />
          </NavbarGroup>
        </div>
      )}
    </nav>
  );
}

/** Use gestures within the label */
const NavbarGestureLabel = () => {
  useGestures();
  return <NavbarGroupLabel>Gestures</NavbarGroupLabel>;
};
