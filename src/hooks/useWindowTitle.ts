import { useEffect, useMemo } from "react";
import { useSelect } from "hooks/useStore";
import { selectProjectName } from "types/Meta/MetaSelectors";

/** Custom hook for changing the browser title. */
export function useWindowTitle(view: string) {
  const name = useSelect(selectProjectName);

  // Memoize the title to avoid unnecessary re-renders
  const title = useMemo(() => {
    if (view === "projects") return `Harmonia • Projects`;
    if (view === "demos") return `Harmonia • Demos`;
    if (view === "samples") return `Harmonia • Samples`;
    if (view === "playground") return `Playground • ${name}`;
    return "Harmonia";
  }, [name, view]);

  // Update the document when the title changes
  useEffect(() => {
    document.title = title;
  }, [title]);
}
