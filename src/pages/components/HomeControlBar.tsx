import classNames from "classnames";
import { PropsWithChildren, ReactNode } from "react";

export const HomeControlBar = (props: PropsWithChildren) => {
  const { children } = props;
  return (
    <div className="w-full my-6 mt-auto p-4 rounded-lg flex items-center max-[600px]:justify-center gap-6 ring-2 shadow-xl backdrop-blur bg-slate-950/60 ring-indigo-500/80 animate-in fade-in">
      {children}
    </div>
  );
};

export const HomeControlButton = (props: {
  className?: string;
  small?: boolean;
  title?: string;
  icon?: ReactNode;
  onClick?: () => void;
  onMouseLeave?: () => void;
}) => {
  const { className, small, title, icon, onClick } = props;
  return (
    <div
      className={classNames(
        small ? "" : "xl:w-36 text-5xl size-12 border px-2",
        !!onClick ? "cursor-pointer" : "",
        "rounded-3xl *:mx-auto group xl:rounded flex shrink-0 items-center text-center select-none",
        className
      )}
      onClick={onClick}
      onMouseLeave={props.onMouseLeave}
    >
      {!title ? null : (
        <span
          className={classNames(
            "max-xl:hidden text-sm",
            !!onClick ? "group-hover:opacity-85" : ""
          )}
        >
          {title}
        </span>
      )}
      {icon}
    </div>
  );
};
