import { useLandingError } from "../hooks/useLandingError";
import { useAuth } from "providers/auth";
import { LandingLibraryHero } from "../views/LandingLibraryHero";
import { LandingObservatory } from "../views/LandingObservatory";
import { LandingPatternHero } from "../views/LandingPatternHero";
import { LandingPianoHero } from "../views/LandingPianoHero";
import { LandingPortalHero } from "../views/LandingPortalHero";
import { LandingPoseHero } from "../views/LandingPoseHero";
import { LandingPricingHero } from "../views/LandingPricingHero";
import { LandingScaleHero } from "../views/LandingScaleHero";
import { LandingTimelineHero } from "../views/LandingTimelineHero";
import { LandingWhyHero } from "../views/LandingWhyHero";
import { LandingSplashScreen } from "../views/LandingSplashScreen";

export function LandingBody() {
  const { hasError } = useLandingError();
  const { isAuthorized } = useAuth();
  if (hasError || !isAuthorized) return null;
  return (
    <>
      <LandingSplashScreen />
      <LandingPricingHero />
      <LandingLibraryHero />
      <LandingTimelineHero />
      <LandingScaleHero />
      <LandingPatternHero />
      <LandingPoseHero />
      <LandingPortalHero />
      <LandingPianoHero />
      <LandingWhyHero />
      <LandingObservatory />
    </>
  );
}
