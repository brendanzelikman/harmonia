import { capitalize } from "lodash";
import { ClipboardHotkeys } from "./clipboard";
import { GlobalHotkeys } from "./global";
import { ProjectHotkeys } from "./project";
import { SelectionHotkeys } from "./selection";
import { TimelineHotkeys } from "./timeline";
import { TrackHotkeys } from "./track";
import { TransportHotkeys } from "./transport";
import { Dispatch } from "types/Project/ProjectTypes";

// A hotkey can be accompanied by a name and description for documentation
export type Hotkey = {
  shortcut: string;
  callback: (dispatch: Dispatch, e: Event) => void;
  name?: string;
  description?: string;
};

// The hotkeys are combined from multiple categories
export const combinedHotkeys = [
  ...GlobalHotkeys,
  ...ProjectHotkeys,
  ...TransportHotkeys,
  ...TrackHotkeys,
  ...ClipboardHotkeys,
  ...SelectionHotkeys,
  ...TimelineHotkeys,
];

export type HotkeyMap = Record<string, (dispatch: Dispatch, e: Event) => void>;

// The hotkeys are exported as a record of shortcut to callback
export const hotkeyMap: HotkeyMap = {};
for (const hotkey of combinedHotkeys) {
  hotkeyMap[hotkey.shortcut] = hotkey.callback;
}

// ------------------------------------------------
// Hotkey Formatting
// ------------------------------------------------

// Format a shortcut
export const formatShortcut = (shortcut: string) => {
  let result = shortcut;
  result = result.replace("shift", "⇧");
  result = result.replace("alt", "⌥");
  result = result.replace("ctrl", "⌃");
  result = result.replace("meta", "⌘");
  result = result.replace("slash", "/");
  result = result.replace("comma", ",");
  result = result.replace("period", ".");
  result = result.replace("backspace", "⌫");
  result = result.replace("equal", "=");
  result = result.replace("arrowleft", "←");
  result = result.replace("arrowright", "→");
  result = result.replace("arrowup", "↑");
  result = result.replace("arrowdown", "↓");
  result = result.replace("`", "Tilde");
  result = capitalize(result);
  result = result.replace(/\b[a-zA-Z]\b/g, (match) => match.toUpperCase());
  result = result.replace("escape", "Escape");
  result = result.replace(/\s*\+\s*/g, " + ");
  if (result === " ") result = "Space";
  return result;
};
