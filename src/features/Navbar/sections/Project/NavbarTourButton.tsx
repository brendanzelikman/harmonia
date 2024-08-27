import { useOnboardingTour } from "features/Tour";

export function NavbarTourButton() {
  const Tour = useOnboardingTour();
  return Tour.Button;
}
