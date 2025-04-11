import { BaseSyntheticEvent, KeyboardEvent, useEffect } from "react";

// ------------------------------------------------------------
// Custom Events
// ------------------------------------------------------------

/** Dispatch a custom window event of the given type and detail. */
export const dispatchCustomEvent = (type: string, detail?: unknown) => {
  const customEvent = new CustomEvent(type, { detail });
  window.dispatchEvent(customEvent);
};

/** Dispatch the custom event when the condition changes  */
export const dispatchCustomEventOnChange = (
  type: string,
  condition = false
) => {
  useEffect(() => {
    dispatchCustomEvent(type, condition);
  }, [type, condition]);
};

// ------------------------------------------------------------
// Generic Events
// ------------------------------------------------------------

/** Cancel the event and stop all propagation. */
export const cancelEvent = (e: BaseSyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** Check if the user is targeting an input or textarea element. */
export const isInputEvent = (e: Event) => {
  const tagName = (e.target as HTMLElement)?.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA";
};

/** Blur the targeted element of the event. */
export const blurEvent = (e: BaseSyntheticEvent) => {
  (e.currentTarget as HTMLElement).blur();
};

/** Blur the targeted element when the user presses Enter.  */
export const blurOnEnter = (e: KeyboardEvent, callback?: () => void) => {
  if (e.key === "Enter") {
    (e.currentTarget as HTMLElement).blur();
    callback?.();
  }
};

// ------------------------------------------------------------
// File Events
// ------------------------------------------------------------

/** Get the files of an event */
export const getEventFiles = (event: Event) => {
  return (event.target as HTMLInputElement)?.files ?? [];
};

/** Get the first file of an event. */
export const getEventFile = (event: Event) => {
  return (event.target as HTMLInputElement)?.files?.[0];
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
