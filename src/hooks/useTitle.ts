import { useEffect } from "react";

/** Custom hook for changing the window title. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
