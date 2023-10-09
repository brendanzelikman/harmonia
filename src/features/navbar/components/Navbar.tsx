import logo from "/logo.svg";
import Timer from "./Timer";
import Transport from "./Transport";
import FileControl from "./FileControl";
import PatternControl from "./PatternControl";
import Settings from "./Settings";
import { BsGithub, BsQuestionCircle } from "react-icons/bs";
import { Transition } from "@headlessui/react";
import PatternListbox from "./PatternListbox";
import OnboardingTour from "./OnboardingTour";
import { blurOnEnter } from "utils";
import { InputHTMLAttributes, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function Navbar() {
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
      <NavGroup className="flex-shrink-0 ml-3">
        <NavBrand />
      </NavGroup>
      <NavGroup className="ml-5">
        <FileControl />
      </NavGroup>
      <NavGroup className="ml-3">
        <Timer />
      </NavGroup>
      <NavGroup className="space-x-2 ml-4" role="group">
        <Transport />
      </NavGroup>
      <NavGroup className="ml-5">
        <PatternListbox />
      </NavGroup>
      <NavGroup className="ml-5 mr-3">
        <PatternControl />
      </NavGroup>
      <NavGroup className="relative ml-auto mr-5 hidden md:flex">
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
      </NavGroup>
    </Transition>
  );
}

function NavGroup(props: any) {
  return (
    <div
      {...props}
      className={`${props.className ?? ""} flex justify-center items-center`}
      role="group"
    >
      {props.children}
    </div>
  );
}

function NavBrand() {
  return (
    <a href="/harmonia/" className="select-none">
      <img src={logo} alt="Logo brand" className="w-10 h-10" />
    </a>
  );
}

export function NavButton({
  className = "",
  disabled = false,
  disabledClass = "bg-slate-400/30",
  children,
  onClick,
  label,
}: {
  children: any;
  className?: string;
  disabled?: boolean;
  disabledClass?: string;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={disabled ? () => null : onClick}
      className={`${className ?? ""} ${
        disabled ? disabledClass : ""
      } flex items-center justify-center rounded focus:outline-none`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export const NavbarTooltip = (props: any) => (
  <Transition
    show={!!props.show}
    className={`absolute top-[3rem] p-1 font-bold font-nunito text-sm rounded border border-slate-50/50 whitespace-nowrap ${
      props.className ?? ""
    }`}
    enter="transition-all ease-out duration-150"
    enterFrom="transform opacity-0 scale-75"
    enterTo="transform opacity-100 scale-100"
    leave="transition-all ease-in duration-150"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-75"
  >
    {props.content}
  </Transition>
);

export const NavbarFormGroup = (props: any) => (
  <div
    className={`flex h-10 relative items-center justify-center w-full text-white rounded cursor-pointer ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const NavbarFormLabel = (props: any) => (
  <label
    className={`text-sm mr-auto mx-2 px-1 font-medium cursor-pointer ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </label>
);

interface NavbarFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export const NavbarFormInput = (props: NavbarFormInputProps) => (
  <input
    {...props}
    className={`h-8 block px-2 bg-transparent rounded-lg text-sm focus:outline-none placeholder-slate-400 focus:ring-0 appearance-none ${
      props.className ?? ""
    }`}
    onKeyDown={(e) => {
      props.onKeyDown?.(e);
      blurOnEnter(e);
    }}
  />
);

export const NavbarInfoTooltip = (props: any) => (
  <div className={`relative ${props.className ?? ""}`}>
    <BsQuestionCircle className="w-5 h-5 text-gray-300 hover:text-gray-300 peer" />
    <label className="text-xs absolute w-auto right-7 whitespace-nowrap peer-hover:visible invisible bg-fuchsia-700/90 backdrop-blur-lg font-light -top-1/2 p-2 rounded-xl border border-slate-200/50 inline-block text-right">
      {props.content}
    </label>
  </div>
);
