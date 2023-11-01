import { TrackProps } from ".";
import PatternTrack from "./PatternTrack";
import ScaleTrack from "./ScaleTrack";
import { Menu, Transition } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { Fragment, InputHTMLAttributes, MouseEvent, ReactNode } from "react";
import { isPatternTrack } from "types/PatternTrack";
import { isScaleTrack } from "types/ScaleTrack";
import { TimelineCell } from "types/Timeline";
import { blurOnEnter, cancelEvent } from "utils/html";
import { omit } from "lodash";

export function TrackComponent(props: TrackProps) {
  if (!props.track) return null;
  if (isScaleTrack(props.track)) return <ScaleTrack {...props} />;
  if (isPatternTrack(props.track)) return <PatternTrack {...props} />;
  return null;
}

export const TrackButton = (props: {
  className?: string;
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}) => {
  return (
    <button
      aria-label="Track Button"
      className={`${
        props.className ?? ""
      } flex flex-1 items-center justify-center rounded-md truncate min-w-none min-h-[25px] max-h-[30px] m-1 font-light border`}
      onClick={(e) => {
        props.onClick?.(e);
        e.currentTarget.blur();
      }}
      onDoubleClick={cancelEvent}
    >
      {props.children}
    </button>
  );
};

interface TrackNameProps extends InputHTMLAttributes<HTMLInputElement> {
  cell: TimelineCell;
}
export const TrackName = (props: TrackNameProps) => {
  const isSmall = props.cell.height < 100;
  const size = isSmall ? "text-xs h-6" : "text-sm h-7";
  return (
    <input
      {...props}
      className={`flex-auto font-nunito ${size} bg-zinc-800 px-1 w-full mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-scroll text-gray-300 border-2 border-zinc-800 focus:border-indigo-500`}
      onKeyDown={blurOnEnter}
    />
  );
};

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  cell: TimelineCell;
  icon: JSX.Element;
  showTooltip: boolean;
  tooltipTop: number;
  tooltipClassName: string;
  tooltipContent: string;
}
export const TrackSlider = (props: SliderProps) => {
  const { cell, icon } = props;

  const padding = 50;
  const width = cell.height - padding;
  const marginTop = 0.5 * width - 10;
  const transform = `rotate(270deg) translate(30px,0)`;

  const inputProps = omit(props, [
    "cell",
    "icon",
    "showTooltip",
    "tooltipTop",
    "tooltipClassName",
    "tooltipContent",
  ]);
  return (
    <>
      <div className="flex w-8 flex-col items-center text-slate-300">
        {icon && <span className="text-sm mb-8">{icon}</span>}
        <input
          {...inputProps}
          style={{
            width,
            marginTop,
            transform,
          }}
          type="range"
          onDoubleClick={(e) => {
            props.onDoubleClick?.(e);
            cancelEvent(e);
          }}
        />
      </div>
      {props.showTooltip && (
        <div
          style={{ top: props.tooltipTop }}
          className={`${
            props.tooltipClassName ?? ""
          } absolute left-7 w-16 h-5 flex font-semibold items-center justify-center backdrop-blur border border-slate-300 rounded text-xs`}
        >
          {props.tooltipContent}
        </div>
      )}
    </>
  );
};

export const TrackDropdownMenu = (props: {
  className?: string;
  content?: string;
  children: ReactNode;
}) => {
  return (
    <Menu
      as="div"
      className="relative inline-block focus:ring-0 active:ring-0 focus:border-0 active:border-0"
    >
      {({ open }) => (
        <>
          <div className="w-full">
            <Menu.Button
              aria-label="Track Dropdown Menu"
              className={`w-full h-full rounded ${
                open ? "text-indigo-400" : "text-white"
              } outline-none`}
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
            <Menu.Items className="absolute top-0 -right-[13.5rem] w-48 bg-zinc-900/80 backdrop-blur rounded text-md py-2 select-none focus:outline-none">
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
