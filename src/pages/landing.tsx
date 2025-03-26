import { useRef } from "react";
import { useLandingError } from "features/Landing/hooks/useLandingError";
import { useLandingHotkeys } from "features/Landing/hooks/useLandingHotkeys";
import { LandingBackground } from "features/Landing/components/LandingBackground";
import { LandingBody } from "features/Landing/components/LandingBody";

export function LandingPage() {
  const { hasError, ErrorStack } = useLandingError();
  const mainRef = useRef<HTMLDivElement>(null);
  useLandingHotkeys(mainRef);
  return (
    <main
      ref={mainRef}
      className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll"
    >
      <LandingBackground />
      <LandingBody />
      {hasError && <ErrorStack />}
    </main>
  );
}
