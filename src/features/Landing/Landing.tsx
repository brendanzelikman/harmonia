import { useNavigate } from "react-router-dom";
import { useError } from "app/router";
import { Splash } from "features/Landing/LandingSplash";
import { LandingDescription } from "./LandingDescription";
import { LandingFooter } from "./LandingFooter";
import { LandingLibraries } from "./LandingLibraries";
import { useHotkeys } from "hooks/useHotkeys";
import { LandingDetail } from "./LandingDetail";
import { LandingVideo } from "./LandingVideo";
import { LandingPiano } from "./LandingPiano";
import { Navbar } from "features/Navbar/Navbar";

/** The landing page is the entry point of the website */
export function LandingPage() {
  const navigate = useNavigate();
  const { hasError, Stack } = useError();
  useHotkeys({ enter: () => navigate("/projects") });
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
            <LandingVideo />
            <LandingLibraries />
            <LandingPiano />
            <LandingFooter />
          </>
        )}
      </div>
    </div>
  );
}
