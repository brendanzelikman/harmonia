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

export const codeCharMap: Record<string, string> = {
  Escape: "escape",
  Backquote: "`",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
  KeyQ: "q",
  KeyW: "w",
  KeyE: "e",
  KeyR: "r",
  KeyT: "t",
  KeyY: "y",
  KeyU: "u",
  KeyI: "i",
  KeyO: "o",
  KeyP: "p",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  Semicolon: ";",
  Quote: "'",
  ShiftLeft: "shift",
  KeyZ: "z",
  KeyX: "x",
  KeyC: "c",
  KeyV: "v",
  KeyB: "b",
  KeyN: "n",
  KeyM: "m",
  Comma: ",",
  Period: ".",
  Slash: "/",
  ControlLeft: "ctrl",
  AltLeft: "alt",
  MetaLeft: "meta",
  Space: " ",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
};

export const getHotkeyShortcut = (hotkey: Hotkey) => {
  return hotkey.shortcut
    .split("+")
    .map((part) =>
      part === "+" ? " + " : part === "meta" ? "Cmd" : capitalize(part)
    )
    .join(" + ");
};

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
