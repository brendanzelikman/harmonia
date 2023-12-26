import classNames from "classnames";

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
        `flex w-full items-center h-10 py-1 text-slate-200 animate-in fade-in duration-150`,
        props.border ? "border-b border-b-slate-500" : ""
      )}
    >
      {props.children}
    </div>
  );

export const EditorTabGroup = (props: {
  children?: any;
  border?: boolean;
  className?: string;
}) => (
  <div
    className={classNames(props.className, "flex text-lg px-3 space-x-2", {
      "border-r border-r-slate-500": !!props.border,
    })}
  >
    {props.children}
  </div>
);
