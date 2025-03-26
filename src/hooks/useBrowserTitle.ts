import { useEffect, useMemo } from "react";
import { useRouterPath } from "router";
import { useDeep } from "types/hooks";
import { selectProjectName } from "types/Meta/MetaSelectors";

export function useBrowserTitle() {
  const view = useRouterPath();
  const name = useDeep(selectProjectName);

  const title = useMemo(() => {
    if (view === "projects") return `Harmonia • Projects`;
    if (view === "demos") return `Harmonia • Demos`;
    if (view === "playground") return `Playground • ${name}`;
    return "Harmonia";
  }, [name, view]);

  useEffect(() => {
    document.title = title;
  }, [title]);
}
