import { uploadProject } from "app/projects";
import { CALCULATOR, TUTORIAL } from "app/router";
import { DEMOS_BY_KEY } from "lib/demos";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";

/** Redirect the user to the calculator on specific routes. */
export const useCalculatorAliases = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const redirect = () => navigate(CALCULATOR, { replace: true });

  useEffect(() => {
    // For the tutorial, create a project and redirect
    if (pathname.startsWith(TUTORIAL)) {
      uploadProject().then(redirect);
    }

    // For a demo, load the demo and redirect
    else if (pathname.startsWith("/demo/")) {
      const id = pathname.slice(6);
      const demo = DEMOS_BY_KEY[id];
      if (demo) loadDemoProject(demo.project, redirect);
      else redirect();
    }
  }, [pathname]);
};
