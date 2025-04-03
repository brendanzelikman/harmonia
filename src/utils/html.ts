import { promptModal, PromptModalProps } from "components/PromptModal";
import {
  BaseSyntheticEvent,
  DragEvent,
  MouseEvent,
  ReactNode,
  useEffect,
} from "react";

// ------------------------------------------------------------
// Custom Events
// ------------------------------------------------------------

/** Sleep the user for the given time. */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Dispatch a custom window event of the given type and detail. */
export const dispatchCustomEvent = (type: string, detail?: unknown) => {
  const customEvent = new CustomEvent(type, { detail });
  window.dispatchEvent(customEvent);
};

/** Dispatch the custom event when the condition changes  */
export const dispatchEventOnChange = (type: string, condition = false) => {
  useEffect(() => {
    dispatchCustomEvent(type, condition);
  }, [type, condition]);
};

/** Prompts the user then applies a callback for the numerical result. */
export const promptUserForString =
  (
    props: PromptModalProps & {
      callback: (input: string) => unknown;
    }
  ) =>
  async () => {
    const { callback, ...rest } = props;
    const input = await promptModal({ ...rest });
    callback(input);
  };

/** Prompts the user then applies a callback for the numerical result. */
export const promptUserForNumber =
  (
    title: ReactNode,
    description: ReactNode,
    callback: (input: number) => unknown
  ) =>
  async () => {
    const input = await promptModal({ title, description });
    const sanitizedInput = parseInt(input ?? "");
    if (!isNaN(sanitizedInput)) await callback(sanitizedInput);
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

/** Read an audio file from the user and call the callback with the event. */
export const promptUserForAudioFile = (onChange: (e: Event) => void) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  input.onchange = onChange;
  document.body.appendChild(input);
  input.click();
  input.remove();
};

// ------------------------------------------------------------
// Generic Events
// ------------------------------------------------------------

type GenericKeyboardEvent = KeyboardEvent | React.KeyboardEvent<HTMLElement>;
type GenericMouseEvent = MouseEvent | React.MouseEvent<HTMLElement, MouseEvent>;
type GenericDragEvent = DragEvent<HTMLElement> | React.DragEvent<HTMLElement>;
type GenericTouchEvent = TouchEvent | React.TouchEvent<HTMLElement>;

export type DivMouseEvent = React.MouseEvent<HTMLDivElement>;
export type ButtonMouseEvent = React.MouseEvent<HTMLButtonElement>;

/** A `GenericEvent` includes HTML and React events in addition to the native Event. */
export type GenericEvent =
  | Event
  | GenericKeyboardEvent
  | GenericMouseEvent
  | GenericDragEvent
  | GenericTouchEvent;

/** Blur the targeted element of the event. */
export const blurEvent = (e: BaseSyntheticEvent) => {
  (e.currentTarget as HTMLElement).blur();
};

/** Blur the targeted element when the user presses Enter.  */
export const blurOnEnter = (e: GenericEvent) => {
  if ((e as GenericKeyboardEvent).key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
  }
};

/* Fire the callback when the user presses Enter. */
export const onEnter = (e: GenericEvent, callback: () => unknown) => {
  if ((e as GenericKeyboardEvent).key === "Enter") {
    callback();
  }
};

/** Cancel the event and stop all propagation. */
export const cancelEvent = (e: BaseSyntheticEvent) => {
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

/** Check if the user is pressing a letter key during a keyboard event. */
export const isPressingLetter = (e: GenericEvent) => {
  return /^[a-zA-Z]$/.test((e as KeyboardEvent).key);
};

/** A regular expression for validating email addresses. */
export const EmailRegex =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
