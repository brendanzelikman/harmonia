import { MenuItem } from "@headlessui/react";
import classNames from "classnames";

export const TrackDropdownButton = (props: {
  className?: string;
  onClick?: () => void;
  content: string;
  icon: JSX.Element;
  divideStart?: boolean;
  divideEnd?: boolean;
}) => {
  return (
    <MenuItem>
      {() => (
        <div
          className={classNames(
            props.divideStart ? "border-t border-t-slate-500" : "",
            props.divideEnd ? "border-b border-b-slate-500" : "",
            "flex text-left items-center hover:bg-zinc-500/60 cursor-pointer px-4 py-2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            props.onClick?.();
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
    </MenuItem>
  );
};
