import { useNavigate } from "react-router-dom";
import { useAuthenticationStatus } from "hooks";
import { useHotkeys } from "react-hotkeys-hook";
import { useLandingError } from "features/Landing/hooks/useLandingError";
import { useLandingPassword } from "features/Landing/hooks/useLandingPassword";
import { useLandingHotkeys } from "features/Landing/hooks/useLandingHotkeys";
import Background from "assets/images/landing-background.png";
import { LandingSplashScreen } from "features/Landing/LandingSplashScreen";
import { Landing } from "features/Landing";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAtLeastStatus } = useAuthenticationStatus();
  const { promptPassword } = useLandingPassword();
  useLandingHotkeys();

  // Handle the landing page errors
  const { hasError, errorMessage, ErrorStack } = useLandingError();
  const showBody = !hasError && !!isAuthenticated;
  const showStack = hasError;

  // Show the error in the subtitle if there is one
  const subtitle = hasError ? errorMessage : "Illuminate the Geometry of Music";
  const subtitleClass = hasError
    ? "font-light sm:text-2xl text-lg text-red-500"
    : "font-normal sm:text-4xl text-xl drop-shadow-xl";

  // Prompt the user for the password
  useHotkeys("meta+shift+p", () => promptPassword(false));

  // Redirect the user or prompt them for the password
  // * Shift + Click = Go To Playground
  // * Alt + Click = Prompt Password
  // * Click = Go To Projects
  const onButtonClick = (e: React.MouseEvent) => {
    if (isAuthenticated && !e.altKey) {
      if (e.shiftKey) return navigate("/playground");
      return navigate(isAtLeastStatus("pro") ? "/projects" : "/demos");
    } else {
      promptPassword(true);
    }
  };

  return (
    <main className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll">
      <img
        src={Background}
        className="fixed opacity-50 h-screen object-cover landing-background"
      />
      <LandingSplashScreen
        subtitle={subtitle}
        subtitleClass={subtitleClass}
        onButtonClick={onButtonClick}
      />
      {showBody && (
        <>
          <Landing.PricingHero />
          <Landing.LibraryHero />
          <Landing.TimelineHero />
          <Landing.ScaleHero />
          <Landing.PatternHero />
          <Landing.PoseHero />
          <Landing.PortalHero />
          <Landing.PianoHero />
          <Landing.WhyHero />
          <Landing.Observatory />
        </>
      )}
      {showStack && <ErrorStack />}
    </main>
  );
}
