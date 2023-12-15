import { promptModal } from "components/Modal";
import { DragEvent, MouseEvent } from "react";

// ------------------------------------------------------------
// Custom Events
// ------------------------------------------------------------

/** Dispatch a custom window event of the given type and detail. */
export const dispatchCustomEvent = (type: string, detail?: unknown) => {
  const customEvent = new CustomEvent(type, { detail });
  window.dispatchEvent(customEvent);
};

/** Prompts the user then applies a callback for the numerical result. */
export const promptUser =
  (title: string, message: string, callback: (input: number) => unknown) =>
  async () => {
    const input = await promptModal(title, message);
    const sanitizedInput = parseInt(input ?? "");
    if (!isNaN(sanitizedInput)) callback(sanitizedInput);
  };

/** Download the given blob using an optional file name. */
export const downloadBlob = (blob: Blob, fileName?: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? "file";
  a.click();
  URL.revokeObjectURL(url);
};

// ------------------------------------------------------------
// Generic Events
// ------------------------------------------------------------

type GenericKeyboardEvent = KeyboardEvent | React.KeyboardEvent<HTMLElement>;
type GenericMouseEvent = MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>;
type GenericDragEvent = DragEvent<HTMLElement> | React.DragEvent<HTMLElement>;
type GenericTouchEvent = TouchEvent | React.TouchEvent<HTMLElement>;

/** A `GenericEvent` includes HTML and React events in addition to the native Event. */
type GenericEvent =
  | Event
  | GenericKeyboardEvent
  | GenericMouseEvent
  | GenericDragEvent
  | GenericTouchEvent;

/** Blur the targeted element of the event. */
export const blurEvent = (e: GenericEvent) => {
  (e.currentTarget as HTMLElement).blur();
};

/** Blur the targeted element when the user presses Enter.  */
export const blurOnEnter = (e: GenericEvent) => {
  if ((e as GenericKeyboardEvent).key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
  }
};

/** Cancel the event and stop all propagation. */
export const cancelEvent = (e: GenericEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// ------------------------------------------------------------
// Generic Event Helpers
// ------------------------------------------------------------

/** Check if the user is targeting an input or textarea element. */
export const isInputEvent = (e: GenericEvent) => {
  const target = e.target as HTMLElement;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
};

/** Check if the user is holding shift during an event. */
export const isHoldingShift = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.shiftKey;
};

/** Check if the user is holding alt/option during an event. */
export const isHoldingOption = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.altKey;
};

/** Check if the user is holding meta during an event. */
export const isHoldingMeta = (e: GenericEvent) => {
  const keyboardEvent = e as KeyboardEvent;
  return keyboardEvent.metaKey || keyboardEvent.ctrlKey;
};

/** Check if the user is holding any modifier during an event. */
export const isHoldingModifier = (e: GenericEvent) => {
  return isHoldingShift(e) || isHoldingOption(e) || isHoldingMeta(e);
};

/** Check if the user is pressing a letter key during a keyboard event. */
export const isPressingLetter = (e: GenericEvent) => {
  return /^[a-zA-Z]$/.test((e as KeyboardEvent).key);
};
