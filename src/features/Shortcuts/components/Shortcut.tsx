import { formatShortcut, Hotkey } from "lib/react-hotkeys-hook";
import { ReactNode } from "react";

export const Shortcut = (
  props:
    | { hotkey: Hotkey }
    | {
        shortcut: string;
        description: ReactNode;
      }
) => {
  const isHotkey = "hotkey" in props;
  const shortcut = isHotkey ? props.hotkey.shortcut : props.shortcut;
  const description = isHotkey ? props.hotkey.name : props.description;
  return (
    <li className="px-8 flex gap-8 items-center whitespace-nowrap">
      <span className="font-light w-64 text-slate-200/90">{description}</span>
      <span className="text-bold text-center w-48 my-0.5 py-0.5 bg-slate-800/50 border border-slate-50/25 rounded mr-2 shadow-xl">
        {formatShortcut(shortcut)}
      </span>
    </li>
  );
};
