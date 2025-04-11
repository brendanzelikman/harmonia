import { useEffect, useMemo } from "react";
import { useAppValue } from "hooks/useRedux";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { useRoute } from "app/router";

/** Custom hook for changing the window title. */
export function useWindow() {
  const view = useRoute();
  const name = useAppValue(selectProjectName);

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
