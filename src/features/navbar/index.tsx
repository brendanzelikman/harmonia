import Transport from "./Transport";
import FileMenu from "./File";
import Listbox from "./Listbox";
import Toolkit from "./Toolkit";
import Settings from "./Settings";
import OnboardingTour from "./Tour";

import { BsGithub } from "react-icons/bs";
import { Transition } from "@headlessui/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { NavbarBrand, NavbarGroup } from "./components";

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
      className="relative h-auto bg-gray-900 border-b-0.5 border-b-slate-700 shadow-xl py-2 text-slate-50 flex flex-nowrap flex-shrink-0 items-center z-30"
    >
      <NavbarGroup className="flex-shrink-0 ml-3">
        <NavbarBrand />
      </NavbarGroup>
      <NavbarGroup className="ml-5">
        <FileMenu />
      </NavbarGroup>
      <NavbarGroup className="ml-3">
        <Transport />
      </NavbarGroup>
      <NavbarGroup className="ml-5">
        <Listbox />
      </NavbarGroup>
      <NavbarGroup className="ml-5 mr-3">
        <Toolkit />
      </NavbarGroup>
      <NavbarGroup className="relative ml-auto mr-5 hidden md:flex">
        <Settings />
        <OnboardingTour />
        <a
          href="https://www.github.com/brendanzelikman/harmonia"
          target="_blank"
          rel="noreferrer"
          className="ml-4 text-2xl active:text-sky-600/80"
        >
          <BsGithub />
        </a>
      </NavbarGroup>
    </Transition>
  );
}
