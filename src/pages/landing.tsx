import { useRef } from "react";
import { useLandingError } from "features/Landing/hooks/useLandingError";
import { useLandingHotkeys } from "features/Landing/hooks/useLandingHotkeys";
import { AccountPage } from "features/Account/AccountPage";
import { LandingBackground } from "features/Landing/components/LandingBackground";
import { LandingBody } from "features/Landing/components/LandingBody";

export const landingActions = [
  "idle",
  "login",
  "magic-link",
  "magic-electron",
] as const;

export type LandingAction = (typeof landingActions)[number];

export function LandingPage(props: { action: LandingAction }) {
  const { hasError, ErrorStack } = useLandingError();
  const mainRef = useRef<HTMLDivElement>(null);
  const isIdle = props.action === "idle";
  useLandingHotkeys(mainRef);
  return (
    <main
      ref={mainRef}
      className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll"
    >
      <LandingBackground />
      {isIdle ? <LandingBody /> : <AccountPage {...props} />}
      {hasError && <ErrorStack />}
    </main>
  );
}
