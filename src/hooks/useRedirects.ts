import { uploadProject } from "app/projects";
import { MAIN, useRoute } from "app/router";
import { DEMOS_BY_KEY } from "lib/demos";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";

export const useRedirects = () => {
  const { id } = useParams();
  const view = useRoute();
  const navigate = useNavigate();
  const redirect = () => navigate(MAIN);

  useEffect(() => {
    // For the tutorial, create a project and redirect
    if (view.startsWith("/tutorial")) {
      uploadProject().then(redirect);
    }

    // For a demo, load the demo and redirect
    if (view.startsWith("/demo") && !!id) {
      const demo = DEMOS_BY_KEY[id];
      if (demo) loadDemoProject(demo.project, redirect);
    }
  }, [view, id]);
};
