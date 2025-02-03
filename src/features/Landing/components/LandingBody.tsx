import { useLandingError } from "../hooks/useLandingError";
import { LandingPricingHero } from "../views/LandingPricingHero";
import { LandingSplashScreen } from "../views/LandingSplashScreen";

export function LandingBody() {
  const { hasError } = useLandingError();
  if (hasError) return null;
  return (
    <>
      <LandingSplashScreen />
      <LandingPricingHero />
    </>
  );
}
