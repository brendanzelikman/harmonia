import { useError } from "app/router";
import { Splash } from "features/Landing/LandingSplash";
import { LandingDescription } from "./LandingDescription";
import { LandingFooter } from "./LandingFooter";
import { LandingLibraries } from "./LandingLibraries";
import { LandingDetail } from "./LandingDetail";
import { LandingVideo } from "./LandingVideo";
import { LandingPiano } from "./LandingPiano";
import { Navbar } from "features/Navbar/Navbar";
import { LandingDemos } from "./LandingDemos";

/** The landing page is the entry point of the website */
export function LandingPage() {
  const { hasError, Stack } = useError();
  return (
    <div className="relative size-full">
      <div className="max-lg:hidden absolute size-full">
        <Navbar />
      </div>
      <div className="relative size-full pt-20 overflow-scroll select-none">
        <Splash />
        {hasError && <Stack />}
        {!hasError && (
          <>
            <LandingDescription />
            <LandingDetail />
            <LandingDemos />
            <LandingLibraries />
            <LandingVideo />
            <LandingPiano />
            <LandingFooter />
          </>
        )}
      </div>
    </div>
  );
}
