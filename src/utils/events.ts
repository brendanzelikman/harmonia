export const dispatchCustomEvent = (type: string, detail?: unknown) => {
  const customEvent = new CustomEvent(type, { detail });
  window.dispatchEvent(customEvent);
};
