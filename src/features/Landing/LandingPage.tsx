import { LandingSplash } from "features/Landing/sections/LandingSplash";
import { LandingDescription } from "./sections/LandingDescription";
import { LandingFooter } from "./sections/LandingFooter";
import { LandingDetail } from "./sections/LandingDetail";
import { LandingVideo } from "./sections/LandingVideo";
import { LandingPiano } from "./sections/LandingPiano";
import { LandingDemos } from "./sections/LandingDemos";
import { LandingCreators } from "./sections/LandingCreators";
import { useTitle } from "hooks/useTitle";

/** The landing page is the entry point of the website */
export function LandingPage() {
  useTitle("Harmonia | Musical Calculator");
  return (
    <main className="size-full pt-nav">
      <div className="size-full pt-5 overflow-scroll">
        <LandingSplash />
        <LandingDescription />
        <LandingDetail />
        <LandingDemos />
        <LandingVideo />
        <LandingCreators />
        <LandingPiano />
        <LandingFooter />
      </div>
    </main>
  );
}
