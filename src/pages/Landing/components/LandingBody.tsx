import { LandingLibraryHero } from "../views/LandingLibraryHero";
import { LandingPianoHero } from "../views/LandingPianoHero";
import { LandingPricingHero } from "../views/LandingPricingHero";
import { LandingSplashScreen } from "../views/LandingSplashScreen";

export function LandingBody() {
  return (
    <>
      <LandingSplashScreen />
      <LandingPricingHero />
      <LandingLibraryHero />
      <LandingPianoHero />
    </>
  );
}
