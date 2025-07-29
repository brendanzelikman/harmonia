import { uploadProject } from "app/projects";
import { CALCULATOR, TOUR, TUTORIAL } from "app/router";
import { DEMOS_BY_KEY } from "lib/demos";
import { playTour } from "lib/tour/useTour";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";

/** Redirect the user to the calculator on specific routes. */
export const useCalculatorAliases = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const redirect = async () => await navigate(CALCULATOR, { replace: true });

  useEffect(() => {
    // For the tour, run the command
    if (pathname.startsWith(TOUR)) {
      redirect().then(playTour);
      return;
    }

    // For the tutorial, create a project and redirect
    if (pathname.startsWith(TUTORIAL)) {
      uploadProject().then(redirect);
      return;
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
