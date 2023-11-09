import { Transition } from "@headlessui/react";
import { OnboardingTour } from "features/Tour";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { NAV_HEIGHT } from "utils/constants";
import { NavbarFileMenu } from "./NavbarFileMenu";
import { NavbarPatternListbox } from "./NavbarPatternListbox";
import { NavbarSettingsMenu } from "./NavbarSettings";
import { NavbarToolkit } from "./NavbarToolkit";
import { NavbarTransport } from "./NavbarTransport";
import { NavbarGroup, NavbarBrand } from "./components";

export function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  useHotkeys("meta+shift+f", () => setShowNavbar(!showNavbar), [showNavbar]);

  return (
    <Transition
      id="navbar"
      show={showNavbar}
      enter="transition-opacity"
      enterFrom="opacity-0"
      enterTo="opacity-100 scale-100"
      leave="transition-opacity"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0"
      style={{ height: NAV_HEIGHT }}
      className="relative bg-gray-900 border-b-0.5 border-b-slate-700 shadow-xl py-2 text-slate-50 flex flex-nowrap flex-shrink-0 items-center z-30"
    >
      <NavbarGroup className="flex-shrink-0 ml-3">
        <NavbarBrand />
      </NavbarGroup>
      <NavbarGroup className="ml-4">
        <NavbarFileMenu />
      </NavbarGroup>
      <NavbarGroup className="ml-3">
        <NavbarTransport />
      </NavbarGroup>
      <NavbarGroup className="ml-4 relative">
        <NavbarPatternListbox />
      </NavbarGroup>
      <NavbarGroup className="ml-3">
        <NavbarToolkit />
      </NavbarGroup>
      <NavbarGroup className="relative ml-auto mr-2 hidden md:flex">
        <NavbarSettingsMenu />
        <OnboardingTour />
      </NavbarGroup>
    </Transition>
  );
}
