import { useLandingError } from "pages/Landing/hooks/useLandingError";
import { useLandingHotkeys } from "pages/Landing/hooks/useLandingHotkeys";
import { LandingBackground } from "pages/Landing/components/LandingBackground";
import { LandingBody } from "pages/Landing/components/LandingBody";

export function LandingPage() {
  const { hasError, ErrorStack } = useLandingError();
  useLandingHotkeys();
  return (
    <main className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll">
      <LandingBackground />
      <LandingBody />
      {hasError && <ErrorStack />}
    </main>
  );
}
