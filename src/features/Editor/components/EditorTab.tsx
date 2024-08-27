import classNames from "classnames";
import { ReactNode } from "react";

export const EditorTab = (props: {
  show: boolean;
  border?: boolean;
  children?: any;
  className?: string;
}) =>
  !props.show ? null : (
    <div
      className={classNames(
        props.className,
        `flex shrink-0 w-full items-center h-12 text-slate-200 animate-in fade-in duration-150`,
        props.border ? "border-b border-b-slate-500" : ""
      )}
    >
      {props.children}
    </div>
  );

export const EditorTabGroup = (props: {
  children?: ReactNode;
  border?: boolean;
  className?: string;
}) => (
  <div
    className={classNames(
      props.className,
      "flex items-center text-base px-3 gap-3",
      { "border-r border-r-slate-500": !!props.border }
    )}
  >
    {props.children}
  </div>
);
