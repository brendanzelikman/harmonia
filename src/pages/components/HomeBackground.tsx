import LandingBackground from "assets/images/landing-background.png";
import { useRouterPath } from "router";

export const HomeBackground = () => {
  const view = useRouterPath();
  if (view === "playground") return null;
  return (
    <img
      src={LandingBackground}
      className="fixed h-screen animate-landing-background select-none opacity-50 -z-10"
    />
  );
};
