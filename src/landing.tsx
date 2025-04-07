import { useNavigate } from "react-router-dom";
import { useError } from "lib/react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { Background } from "components/Background";
import { Splash } from "components/Splash";
import { LandingDescription } from "pages/Landing/Description";
import { LandingLibraries } from "pages/Landing/Libraries";
import { LandingFooter } from "pages/Landing/Footer";

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
