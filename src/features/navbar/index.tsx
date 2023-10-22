import { NavbarTransport } from "./Transport";
import { NavbarFileMenu } from "./File";
import { NavbarPatternListbox } from "./PatternListbox";
import { NavbarToolkit } from "./Toolkit";
import { NavbarSettingsMenu } from "./Settings";
import { Transition } from "@headlessui/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { NavbarBrand, NavbarGroup } from "./components";
import { OnboardingTour } from "features/tour";
import { NAV_HEIGHT } from "utils";

export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  useHotkeys("meta+shift+f", () => setShowNavbar(!showNavbar), [showNavbar]);

  return (
    <Transition
      show={showNavbar}
      enter="transition-opacity"
      enterFrom="opacity-0"
      enterTo="opacity-100 scale-100"
      leave="transition-opacity"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0"
      as="nav"
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
      <NavbarGroup className="ml-4">
        <NavbarPatternListbox />
      </NavbarGroup>
      <NavbarGroup className="ml-3">
        <NavbarToolkit />
      </NavbarGroup>
      <NavbarGroup className="relative ml-auto mr-5 hidden md:flex">
        <NavbarSettingsMenu />
        <OnboardingTour />
      </NavbarGroup>
    </Transition>
  );
}
