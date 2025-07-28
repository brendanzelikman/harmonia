import { NavbarTooltipButton } from "components/TooltipButton";
import { DEMOS_BY_KEY } from "lib/demos";
import { launchTour } from "lib/tour/useTour";
import { useCallback } from "react";
import { BsQuestion } from "react-icons/bs";
import { loadDemoProject } from "types/Project/ProjectLoaders";

export const NavbarTour = () => {
  const loadDemo = useCallback(() => {
    loadDemoProject(DEMOS_BY_KEY["barry_game"].project, launchTour);
  }, []);
  return (
    <NavbarTooltipButton
      className="text-4xl"
      label="Start Tour"
      onClick={loadDemo}
    >
      <BsQuestion />
    </NavbarTooltipButton>
  );
};
