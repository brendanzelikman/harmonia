import { ABOUT, CALCULATOR, SPLASH, TUTORIAL } from "app/router";
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
import { Link, useLocation } from "react-router-dom";
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
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { dispatchClose, dispatchOpen, useToggle } from "hooks/useToggle";
import { useCallback } from "react";
import { NavbarTour } from "./NavbarTour";

export function Navbar() {
  const { pathname } = useLocation();
  const hasTracks = useAppValue(selectHasTracks);
  const onSplash = pathname === SPLASH;
  const brand = useToggle("brand");
  const demos = useToggle("demos");
  const openProjects = useCallback(() => {
    if (brand.isOpen && !demos.isOpen) {
      dispatchClose("brand");
    } else {
      dispatchOpen("brand");
      dispatchClose("demos");
    }
  }, [brand, demos]);
  const openDemos = useCallback(() => {
    if (brand.isOpen && demos.isOpen) {
      dispatchClose("brand");
    } else {
      dispatchOpen("brand");
      dispatchOpen("demos");
    }
  }, [brand, demos]);
  return (
    <nav className="absolute flex flex-nowrap shrink-0 items-center inset-0 bg-slate-900 border-b-[1px] border-b-slate-700 shadow-xl h-nav px-3 z-[300] transition-all animate-in fade-in text-2xl">
      <NavbarBrand />
      {pathname !== CALCULATOR ? (
        <NavbarGroup
          gap="gap-8"
          className="ml-6 border-l border-l-slate-500 pl-6 border-r-0 *:text-xl *:text-slate-200 *:hover:text-slate-50 *:cursor-pointer *:select-none"
        >
          <div
            data-active={brand.isOpen && !demos.isOpen}
            className="data-[active=true]:text-sky-400"
            onClick={openProjects}
          >
            Projects
          </div>
          <div
            data-active={brand.isOpen && demos.isOpen}
            onClick={openDemos}
            className="data-[active=true]:text-sky-400"
          >
            Demos
          </div>
          <Link to={TUTORIAL} className="focus:text-sky-400">
            Tutorial
          </Link>
          <Link
            data-active={pathname === ABOUT}
            to={onSplash ? ABOUT : SPLASH}
            className="data-[active=true]:text-sky-400"
          >
            About
          </Link>
        </NavbarGroup>
      ) : null}
      {pathname === CALCULATOR ? (
        <div className="size-full select-none flex animate-in fade-in slide-in-from-top-4 text-slate-50 first:border-r-0">
          <NavbarGroup
            gap="gap-1"
            className="ml-3 border-l border-l-slate-500/50"
          >
            <NavbarProjectMenu />
            <NavbarSettings />
            <NavbarTour />
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

          {/* Small viewports toggle between actions */}
          <TabGroup className="xl:hidden max-xl:flex gap-2 px-3 h-full shrink-0 items-center text-sm transition-all animate-in fade-in bg-radial from-slate-900/15 to-sky-500/15">
            <TabList as="div" className="flex flex-col items-start text-xs">
              <Tab className="cursor-pointer hover:text-emerald-200 data-selected:text-emerald-400">
                Objects
              </Tab>
              <Tab className="cursor-pointer hover:text-emerald-200 data-selected:text-emerald-400">
                Clips
              </Tab>
              <Tab className="cursor-pointer hover:text-emerald-200 data-selected:text-emerald-400">
                Gestures
              </Tab>
            </TabList>
            <TabPanels className="*:flex *:pl-2 *:gap-2">
              <TabPanel>
                <NavbarCreateTree />
                <NavbarArrangePatterns />
                <NavbarArrangePoses />
              </TabPanel>
              <TabPanel>
                <NavbarTape />
                <NavbarScissors />
                <NavbarPortalGun />
              </TabPanel>
              <TabPanel>
                <NavbarLivePlay />
                <NavbarLeadPlay />
                <NavbarMixPlay />
                <NavbarGameMenu />
              </TabPanel>
            </TabPanels>
          </TabGroup>

          {/* Large viewports have all actions */}
          <div className="max-xl:hidden xl:flex">
            <NavbarGroup className="bg-radial from-slate-900/15 to-sky-500/15">
              <NavbarGroupLabel>Objects</NavbarGroupLabel>
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
        </div>
      ) : (
        <div className="w-full flex gap-4 *:pr-4 *:border-r last:*:border-r-0 *:border-r-slate-600 text-slate-500 justify-end pr-2">
          <NavbarLink v="/calculator" />
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
