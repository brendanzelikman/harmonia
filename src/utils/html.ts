import { DragEvent, MouseEvent } from "react";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const keyCode = (key: string) => key.toUpperCase().charCodeAt(0);

type GenericEvent =
  | Event
  | DragEvent<HTMLElement>
  | React.MouseEvent<HTMLElement, MouseEvent>
  | MouseEvent
  | React.TouchEvent<HTMLElement>;

export const cancelEvent = (e: GenericEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export const isInputEvent = (e: GenericEvent) => {
  const target = e.target as HTMLElement;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
};

export const isHoldingShift = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.shiftKey;
};
export const isHoldingOption = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.altKey;
};
export const isHoldingCommand = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.metaKey || keyboardEvent.ctrlKey;
};
export const isHoldingModifier = (e: GenericEvent) => {
  return isHoldingShift(e) || isHoldingOption(e) || isHoldingCommand(e);
};

export const isLetterKey = (e: KeyboardEvent) => {
  return /^[a-zA-Z]$/.test(e.key);
};

export const SHIFTED_KEY_MAP: Record<string, string> = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "-": "_",
  "=": "+",
  "`": "~",
};
export const upperCase = (key: string) =>
  SHIFTED_KEY_MAP[key] || key.toUpperCase();

export const blurOnEnter = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
  }
};

export const blurOnMouseUp = (e: React.MouseEvent) => {
  (e.currentTarget as HTMLElement).blur();
};

export const isLocalStorageAvailable = () => {
  const test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const getLocalStorageSpace = () => {
  const storage = window.localStorage;
  const usedSpace = JSON.stringify(storage).length;
  const totalSpace = 5 * 1024 * 1024; // 5MB
  const remainingSpace = totalSpace - usedSpace;
  return { usedSpace, remainingSpace, totalSpace };
};
