import classNames from "classnames";
import { EasyTransition } from "components/Transition";

export const EditorTab = (props: {
  show: boolean;
  border?: boolean;
  children?: any;
}) => (
  <EasyTransition
    duration={150}
    className={`flex w-full items-center h-10 py-1 z-[40] text-slate-200 ${
      props.border ? "border-b border-b-slate-500" : ""
    }`}
    show={props.show}
  >
    {props.children}
  </EasyTransition>
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
