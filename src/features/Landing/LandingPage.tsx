import { useError } from "app/router";
import { Splash } from "features/Landing/sections/LandingSplash";
import { LandingDescription } from "./sections/LandingDescription";
import { LandingFooter } from "./sections/LandingFooter";
import { LandingDetail } from "./sections/LandingDetail";
import { LandingVideo } from "./sections/LandingVideo";
import { LandingPiano } from "./sections/LandingPiano";
import { Navbar } from "features/Navbar/Navbar";
import { LandingDemos } from "./sections/LandingDemos";
import { LandingCreators } from "./sections/LandingCreators";
import { useTitle } from "hooks/useTitle";

/** The landing page is the entry point of the website */
export function LandingPage() {
  const { hasError, Stack } = useError();
  useTitle("Harmonia | Musical Calculator");
  return (
    <div className="relative size-full">
      <div className="max-lg:hidden absolute size-full">
        <Navbar />
      </div>
      <div className="relative size-full  pt-20 overflow-scroll select-none">
        <Splash />
        {hasError && <Stack />}
        {!hasError && (
          <>
            <LandingDescription />
            <LandingDetail />
            <LandingDemos />
            <LandingVideo />
            <LandingCreators />
            <LandingPiano />
            <LandingFooter />
          </>
        )}
      </div>
    </div>
  );
}
