import { useEffect, useMemo } from "react";
import { useAppValue } from "hooks/useRedux";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { MAIN, useRoute } from "app/router";
import { DEMOS_BY_KEY } from "lib/demos";
import { useNavigate, useParams } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";
import { uploadProject } from "app/projects";

/** Custom hook for changing the window title. */
export function useWindow() {
  const view = useRoute();
  const navigate = useNavigate();
  const name = useAppValue(selectProjectName);

  // Memoize the title to avoid unnecessary re-renders
  const title = useMemo(() => {
    if (view === MAIN) return `${name} • Harmonia`;
    return "Harmonia | Musical Calculator";
  }, [name, view]);

  // Redirect to a demo if one is selected
  const { id } = useParams();
  useEffect(() => {
    if (view.startsWith("/demo") && !!id) {
      const demo = DEMOS_BY_KEY[id];
      if (demo) loadDemoProject(demo.project, () => navigate(MAIN));
    } else if (view.startsWith("/tutorial")) {
      uploadProject().then(() => navigate(MAIN));
    }
  }, [view, id]);

  // Update the document when the title changes
  useEffect(() => {
    document.title = title;
  }, [title]);
}
