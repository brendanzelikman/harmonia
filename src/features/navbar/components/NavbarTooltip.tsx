import { Transition } from "@headlessui/react";
import { BsQuestionCircle } from "react-icons/bs";

export const NavbarTooltip = (props: any) => (
  <Transition
    show={!!props.show}
    className={`absolute top-[3rem] p-1 px-3 font-bold font-nunito text-sm rounded border border-slate-50/50 whitespace-nowrap backdrop-blur-lg ${
      props.className ?? ""
    }`}
    enter="transition-all ease-out duration-75"
    enterFrom="transform opacity-0 scale-50"
    enterTo="transform opacity-100 scale-100"
    leave="transition-all ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-75"
  >
    {props.content}
  </Transition>
);

export const NavbarInfoTooltip = (props: any) => (
  <div className={`relative ${props.className ?? ""}`}>
    <BsQuestionCircle className="w-5 h-5 text-gray-300 hover:text-gray-300 peer" />
    <span className="text-xs absolute w-auto right-7 whitespace-nowrap peer-hover:visible invisible bg-fuchsia-700/90 backdrop-blur-lg font-light -top-1/2 p-2 rounded-xl border border-slate-200/50 inline-block text-right">
      {props.content}
    </span>
  </div>
);

export const NavbarTooltipMenu = (props: any) => (
  <div className="flex flex-col py-1 w-full h-full justify-center font-normal">
    {props.children}
  </div>
);
