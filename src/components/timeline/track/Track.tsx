import { isPatternTrack, isScaleTrack } from "types/tracks";
import { TrackProps } from ".";
import PatternTrack from "./PatternTrack";
import ScaleTrack from "./ScaleTrack";
import { Disclosure, Menu } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";

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
      className={`${
        props.className ?? ""
      } flex items-center justify-center rounded min-w-7 h-7 m-1 font-light border`}
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
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button
              className={`inline-flex w-full justify-center px-2 rounded items-center font-medium ${
                open ? "text-red-500" : "text-white"
              }`}
            >
              <BsThreeDots className="text-xl" />
            </Menu.Button>
          </div>
          <Menu.Items className="absolute top-0 -right-52 z-60 w-48 bg-zinc-900/80 backdrop rounded text-md py-2">
            {props.children}
          </Menu.Items>
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
