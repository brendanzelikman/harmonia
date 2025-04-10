import { omit } from "lodash";
import { useEffect, useMemo, useState } from "react";

/** Create a record storing a map of keys to press states */
export const useHeldKeys = (keys: string[]) => {
  const keyset = useMemo(() => new Set(keys), []);
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyset.has(key)) setHeldKeys((prev) => ({ ...prev, [key]: true }));
    };
    const keyup = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyset.has(key)) setHeldKeys((prev) => omit(prev, key));
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    };
  }, []);

  return heldKeys;
};
