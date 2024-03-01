import { useNavigate } from "react-router-dom";
import { useLandingError } from "features/Landing/hooks/useLandingError";
import { useLandingHotkeys } from "features/Landing/hooks/useLandingHotkeys";
import Background from "assets/images/landing-background.png";
import { Landing } from "features/Landing";
import { useAuthentication } from "providers/authentication";
import { useSubscription } from "providers/subscription";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useRef } from "react";

export const landingActions = [
  "idle",
  "login",
  "magic-link",
  "magic-electron",
] as const;
export type LandingAction = (typeof landingActions)[number];
interface LandingPageProps {
  action: LandingAction;
}

export function LandingPage(props: LandingPageProps) {
  const { action } = props;
  const navigate = useNavigate();
  const { isAuthenticated, checkPassword } = useAuthentication();
  const { isAtLeastStatus } = useSubscription();
  useLandingHotkeys();

  // Handle the landing page errors
  const { hasError, errorMessage, ErrorStack } = useLandingError();
  const showBody = !hasError && !!isAuthenticated && action === "idle";
  const showStack = hasError;

  // Show the error in the subtitle if there is one
  const subtitle = hasError ? errorMessage : "Illuminate the Geometry of Music";
  const subtitleClass = hasError
    ? "font-light sm:text-2xl text-lg text-red-500"
    : "font-normal sm:text-4xl text-xl drop-shadow-xl";

  // Redirect the user or prompt them for the password
  const onButtonClick = async (e: React.MouseEvent) => {
    await checkPassword();
    if (isAuthenticated && !e.altKey) {
      if (e.shiftKey) return navigate("/playground");
      return navigate(isAtLeastStatus("maestro") ? "/projects" : "/demos");
    } else {
      navigate("/login");
    }
  };

  // Handle landing page scroll
  const mainRef = useRef<HTMLDivElement>(null);
  useOverridingHotkeys("down", () => {
    if (!mainRef.current) return;
    mainRef.current.scrollTo({
      top: mainRef.current.scrollTop + window.innerHeight,
      behavior: "smooth",
    });
  });
  useOverridingHotkeys("up", () => {
    if (!mainRef.current) return;
    mainRef.current.scrollTo({
      top: mainRef.current.scrollTop - window.innerHeight,
      behavior: "smooth",
    });
  });

  const heroes = [
    Landing.PricingHero,
    Landing.LibraryHero,
    Landing.TimelineHero,
    Landing.ScaleHero,
    Landing.PatternHero,
    Landing.PoseHero,
    Landing.PortalHero,
    Landing.PianoHero,
    Landing.WhyHero,
    Landing.Observatory,
  ];

  return (
    <main
      ref={mainRef}
      className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll"
    >
      <img
        src={Background}
        className="fixed opacity-50 h-screen object-cover landing-background"
      />
      {action === "idle" && (
        <Landing.SplashScreen
          subtitle={subtitle}
          subtitleClass={subtitleClass}
          onButtonClick={onButtonClick}
        />
      )}
      {action !== "idle" && <Landing.LoginScreen action={action} />}
      {showBody && (
        <>
          {heroes.map((Hero, i) => (
            <Hero
              key={i}
              scrollToView={() =>
                mainRef.current?.scrollTo?.({
                  top: window.innerHeight * (i + 1),
                  behavior: "smooth",
                })
              }
            />
          ))}
        </>
      )}
      {showStack && <ErrorStack />}
    </main>
  );
}
