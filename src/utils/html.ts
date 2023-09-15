import { DragEvent } from "react";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const keyCode = (key: string) => key.toUpperCase().charCodeAt(0);

type GenericEvent =
  | Event
  | DragEvent<HTMLElement>
  | React.MouseEvent<HTMLElement, MouseEvent>
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

export const blurOnEnter = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
  }
};

export const blurOnMouseUp = (e: React.MouseEvent) => {
  (e.currentTarget as HTMLElement).blur();
};
