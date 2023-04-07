import logo from "/logo.svg";
import Timer from "./Timer";
import Transport from "./Transport";
import FileControl from "./FileControl";
import PatternControl from "./PatternControl";
import AudioControl from "./AudioControl";
import { clearState } from "redux/util";
import { BsQuestionCircle } from "react-icons/bs";
import { Transition } from "@headlessui/react";

export function Navbar() {
  return (
    <nav className="relative min-h-[4.75rem] bg-gray-900 text-slate-50 flex flex-nowrap flex-shrink-0 items-center z-30">
      <NavBackground />
      <NavBar />
    </nav>
  );
}

function NavBar() {
  return (
    <div className="z-20 relative w-full h-full flex border-b border-b-slate-900 py-2 shadow-xl">
      <NavGroup className="flex-shrink-0 ml-3">
        <NavBrand />
      </NavGroup>
      <NavGroup className="ml-5 space-x-2 hidden lg:flex">
        <FileControl />
      </NavGroup>
      <NavGroup className="ml-3">
        <Timer />
      </NavGroup>
      <NavGroup className="space-x-2 ml-3" role="group">
        <Transport />
      </NavGroup>
      <NavGroup className="ml-4 mr-3">
        <PatternControl />
      </NavGroup>
      <NavGroup className="relative ml-auto mr-5 hidden md:flex">
        <AudioControl />
      </NavGroup>
    </div>
  );
}

function NavBackground() {
  return (
    <div className="absolute w-full h-full top-0 left-0">
      <div className="relative h-[4.75rem] overflow-hidden -z-50">
        <div className="absolute w-full h-screen top-0 left-0 bg-gradient-to-r from-gray-900 to-slate-900"></div>
      </div>
    </div>
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
    <>
      <a href="" className="select-none">
        <img src={logo} alt="Logo brand" className="w-12 h-12" />
      </a>
      <div className="relative hidden xl:flex xl:flex-col items-center ml-3 font-light font-nunito">
        <span className="text-3xl font-normal shadow-lg select-none">
          Harmonia
        </span>
      </div>
    </>
  );
}

export function NavButton({
  className = "",
  disabled = false,
  disabledClass = "bg-slate-400/30",
  children,
  onClick,
}: {
  children: any;
  className?: string;
  disabled?: boolean;
  disabledClass?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${className ?? ""} ${
        disabled ? disabledClass : ""
      } flex items-center justify-center min-w-12 rounded focus:outline-none`}
    >
      {children}
    </button>
  );
}

export const NavbarTooltip = (props: any) => (
  <Transition
    show={!!props.show}
    className={`absolute top-[3.5rem] px-3 py-1 font-bold font-nunito rounded border border-slate-50/50 whitespace-nowrap ${
      props.className ?? ""
    }`}
    enter="transition-all duration-100"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-all duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    {props.content}
  </Transition>
);

export const NavbarFormGroup = (props: any) => (
  <div
    className={`flex relative items-center w-full p-1 text-white ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </div>
);

export const NavbarFormLabel = (props: any) => (
  <label
    className={`text-sm mr-auto pr-4 font-normal user-select-none ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </label>
);

export const NavbarFormInput = (props: any) => (
  <input
    {...props}
    onChange={props.onChange}
    value={props.value}
    className={`h-8 block px-2 ml-auto bg-transparent rounded-lg ${
      !!props.value?.length
        ? "border-gray-200 focus:border-gray-200"
        : "border-gray-400 focus:border-gray-400"
    } focus:outline-none focus:ring-0 appearance-none ${props.className ?? ""}`}
  />
);

export const NavbarInfoTooltip = (props: any) => (
  <div className={`relative ${props.className ?? ""}`}>
    <BsQuestionCircle className="w-5 h-5 text-gray-400 hover:text-gray-300 peer" />
    <label className="text-xs absolute -left-48 peer-hover:visible invisible bg-slate-900 font-light w-40 -top-1/2 p-2 rounded border border-white/50 whitespace-normal inline-block text-center">
      {props.content}
    </label>
  </div>
);
