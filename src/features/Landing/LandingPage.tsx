import { LandingSplash } from "features/Landing/sections/LandingSplash";
import { LandingDescription } from "./sections/LandingDescription";
import { LandingFooter } from "./sections/LandingFooter";
import { LandingDetail } from "./sections/LandingDetail";
import { LandingPiano } from "./sections/LandingPiano";
import { useTitle } from "hooks/useTitle";

/** The landing page is the entry point of the website */
export function LandingPage() {
  useTitle("Harmonia | Musical Calculator");
  return (
    <main className="size-full pt-nav">
      <div id="body" className="size-full pt-5 overflow-scroll">
        <LandingSplash />
        <LandingDescription />
        <LandingDetail />
        <LandingPiano />
        <LandingFooter />
      </div>
    </main>
  );
}
