import { ReactNode } from "react";

export const Shortcut = (props: {
  shortcut: ReactNode;
  description: ReactNode;
}) => {
  return (
    <li className="px-8 flex gap-8 items-center whitespace-nowrap">
      <span className="font-light w-64 text-slate-200/90">
        {props.description}
      </span>
      <span className="text-bold text-center w-48 my-0.5 py-0.5 bg-slate-800/50 border border-slate-50/25 rounded mr-2 shadow-xl">
        {props.shortcut}
      </span>
    </li>
  );
};
