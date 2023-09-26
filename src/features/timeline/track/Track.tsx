import { isPatternTrack, isScaleTrack } from "types/tracks";
import { TrackProps } from ".";
import PatternTrack from "./PatternTrack";
import ScaleTrack from "./ScaleTrack";
import { Menu, Transition } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { Fragment } from "react";

export function TrackComponent(props: TrackProps) {
  const { track } = props;
  if (!track) return null;

  if (isScaleTrack(track)) {
    return <ScaleTrack {...props} />;
  }
  if (isPatternTrack(track)) {
    return <PatternTrack {...props} />;
  }
  return null;
}

export const TrackButton = (props: {
  className?: string;
  onClick?: () => void;
  children: JSX.Element;
}) => {
  return (
    <button
      aria-label="Track Button"
      className={`${
        props.className ?? ""
      } flex items-center justify-center rounded-md overflow-hidden min-w-7 h-7 m-1 font-light border`}
      onClick={(e) => {
        props.onClick?.();
        e.currentTarget.blur();
      }}
    >
      {props.children}
    </button>
  );
};

export const TrackDropdownMenu = (props: {
  className?: string;
  content?: string;
  children: JSX.Element;
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left  z-[90]">
      {({ open }) => (
        <>
          <div className="w-full text-center">
            <Menu.Button
              aria-label="Track Dropdown Menu"
              className={`w-full px-2 rounded ${
                open ? "text-indigo-400" : "text-white"
              }`}
            >
              <BsThreeDots className="text-xl" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute top-0 -right-[13rem] w-48 bg-zinc-900/80 backdrop-blur rounded text-md py-2 select-none focus:outline-none">
              {props.children}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export const TrackDropdownButton = (props: {
  className?: string;
  onClick?: () => void;
  content: string;
  icon: JSX.Element;
}) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className="flex text-left items-center hover:bg-zinc-500/60 cursor-pointer px-4 py-2"
          onClick={(e) => {
            props.onClick?.();
            e.currentTarget.blur();
          }}
        >
          <div className="text-xl">{props.icon}</div>
          <button
            className={`${
              props.className ?? ""
            } text-right rounded pl-4 font-light`}
          >
            {props.content}
          </button>
        </div>
      )}
    </Menu.Item>
  );
};
