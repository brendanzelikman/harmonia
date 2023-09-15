import { useEffect } from "react";
import { keyCode } from "utils";

type Callback = (e: Event) => void;
type KeyMap = Record<string, Record<string, Callback>>;

export default function useEventListeners(keyMap: KeyMap, deps: unknown[]) {
  useEffect(() => {
    const funcs: Record<string, Record<string, (e: Event) => void>> = {};

    Object.keys(keyMap).forEach((key) => {
      const listeners = keyMap[key];
      for (const listener in listeners) {
        const func = (e: Event) => {
          if (!(e instanceof KeyboardEvent)) return;
          if (e.key === key) {
            listeners[listener](e);
          }
        };
        if (!funcs[key]) funcs[key] = {};
        funcs[key][listener] = func;
        window.addEventListener(listener, func);
      }
    });

    return () => {
      Object.keys(keyMap).forEach((key) => {
        const listeners = keyMap[key];
        for (const listener in listeners) {
          window.removeEventListener(listener, funcs[key][listener]);
        }
      });
    };
  }, [...deps]);
}
