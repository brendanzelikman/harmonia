import { useEffect } from "react";

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
