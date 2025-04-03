import Background from "assets/images/landing-background.png";

export const LandingBackground = () => (
  <img
    src={Background}
    className="fixed opacity-50 h-screen object-cover animate-landing-background"
  />
);
