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
      className="size-full relative flex max-[800px]:flex-col max-[800px]:gap-4 pt-2 pb-4 rounded overflow-scroll snap-x snap-mandatory animate-in fade-in duration-300 ease-out"
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
    <div className="peer relative max-[800px]:hidden select-none gap-2 p-2 flex order-2 justify-evenly text-md font-bold ease-in-out transition-all duration-500 px-5 mx-auto border rounded border-teal-400/50 text-slate-200">
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
    onMouseLeave?: () => void;
  }>
) => (
  <div
    className={classNames(
      props.className,
      props.border ?? "border border-slate-500",
      props.disabled ? "opacity-50" : "cursor-pointer",
      "w-[70px] text-center py-1 bg-slate-900/50 hover:border-slate-400 relative rounded"
    )}
    onClick={props.onClick}
    onMouseLeave={props.onMouseLeave}
  >
    {props.children}
  </div>
);
