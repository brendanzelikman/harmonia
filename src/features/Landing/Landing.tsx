import { useNavigate } from "react-router-dom";
import { useError } from "app/router";
import { useHotkeys } from "react-hotkeys-hook";
import { Background } from "components/Background";
import { Splash } from "features/Landing/LandingSplash";
import { LandingDescription } from "./LandingDescription";
import { LandingFooter } from "./LandingFooter";
import { LandingLibraries } from "./LandingLibraries";

/** The landing page is the entry point of the website */
export function LandingPage() {
  const navigate = useNavigate();
  const { hasError, Stack } = useError();
  useHotkeys("enter", () => navigate("/projects"));
  return (
    <div className="relative size-full overflow-scroll select-none">
      <Background />
      <Splash />
      {hasError && <Stack />}
      {!hasError && (
        <>
          <LandingDescription />
          <LandingLibraries />
          <LandingFooter />
        </>
      )}
    </div>
  );
}
