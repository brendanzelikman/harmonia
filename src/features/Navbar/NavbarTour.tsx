import { NavbarTooltipButton } from "components/TooltipButton";
import { playTour } from "lib/tour/useTour";
import { BsQuestion } from "react-icons/bs";

export const NavbarTour = () => {
  return (
    <NavbarTooltipButton
      className="text-4xl"
      label="Start Tour"
      onClick={playTour}
    >
      <BsQuestion />
    </NavbarTooltipButton>
  );
};
