import classNames from "classnames";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { PropsWithChildren, useCallback, useRef } from "react";
import { cancelEvent } from "utils/html";

export const HomeList = (props: PropsWithChildren<{ signal: string }>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const resetScroll = useCallback(() => {
    listRef.current?.scrollTo(0, 0);
  }, []);
  useCustomEventListener(props.signal, resetScroll);
  return (
    <div
      ref={listRef}
      className="size-full relative flex max-[800px]:flex-col max-[800px]:gap-4 py-4 rounded overflow-scroll snap-x snap-mandatory animate-in fade-in duration-300 ease-out"
    >
      {props.children}
    </div>
  );
};

export const HomeListItem = (
  props: PropsWithChildren<{ className?: string }>
) => {
  return (
    <div className="snap-start snap-mandatory px-4">
      <div
        className={classNames(
          props.className,
          "flex flex-col items-center size-full gap-4 p-4 w-96 bg-gradient-radial from-sky-900/50 to-slate-950/75 shadow-xl backdrop-blur rounded animate-in fade-in duration-150 text-sm"
        )}
      >
        {props.children}
      </div>
    </div>
  );
};

export const HomeListTitle = (props: { title?: string; fontSize?: string }) => (
  <div
    className={classNames(
      props.fontSize ?? "text-4xl",
      "text-indigo-50 font-bold border-b border-slate-500 w-full py-4 text-center overflow-scroll whitespace-nowrap max-w-96 mb-auto"
    )}
  >
    {props.title}
  </div>
);

export const HomeListSubtitle = (props: {
  title?: string;
  titleColor?: string;
  body?: string;
}) => {
  return (
    <div className="flex gap-1">
      <span className={classNames(props.titleColor, "inline-flex")}>
        {props.title}
      </span>{" "}
      <span className="inline-flex overflow-scroll whitespace-nowrap">
        {props.body}
      </span>
    </div>
  );
};

export const HomeListButtonContainer = (props: PropsWithChildren) => {
  return (
    <div className="peer max-[800px]:hidden select-none gap-2 p-2 flex order-2 justify-evenly text-md font-bold ease-in-out transition-all duration-500 px-5 mx-auto border rounded border-teal-400/50 text-slate-200">
      {props.children}
    </div>
  );
};

export const HomeListButton = (
  props: PropsWithChildren<{
    disabled?: boolean;
    className?: string;
    border?: string;
    onClick?: () => void;
  }>
) => (
  <div
    className={classNames(
      props.className,
      props.border ?? "border border-slate-500",
      props.disabled ? "opacity-50" : "cursor-pointer",
      "min-w-[65px] text-center px-3 py-1 z-50 bg-slate-900/50 hover:border-slate-400 relative rounded"
    )}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const HomeListDeleteMenu = (props: { onClick: () => void }) => {
  return (
    <div className="absolute p-1 w-32 bg-slate-950 shadow-xl left-16 top-4 rounded border-2 border-slate-600/80 text-xs text-slate-200 whitespace-nowrap">
      <p className="pb-1 mb-1 text-center border-b border-b-slate-500 w-full">
        Are you sure?
      </p>
      <div className="flex w-full items-center justify-center">
        <button
          className="px-4 hover:bg-slate-700 hover:text-red-500 rounded"
          onClick={(e) => {
            cancelEvent(e);
            props.onClick();
          }}
        >
          Yes
        </button>
        <button className="px-4 hover:bg-slate-700 hover:text-sky-200 rounded">
          No
        </button>
      </div>
    </div>
  );
};
