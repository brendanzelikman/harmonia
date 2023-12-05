import { NAV_HEIGHT, TRACK_WIDTH } from "utils/constants";
import { useState } from "react";
import { useCustomEventListener } from "hooks";
import { START_TOUR, END_TOUR, SET_TOUR_ID } from "./useOnboardingTour";

// Onboarding tour background
export const TourBackground = () => {
  const [show, setShow] = useState(false);
  const [id, setId] = useState("tour-step-welcome-to-harmonia");

  useCustomEventListener(START_TOUR, () => setShow(true));
  useCustomEventListener(END_TOUR, () => setShow(false));
  useCustomEventListener(SET_TOUR_ID, (e: CustomEvent) => setId(e.detail));

  const Block = ({
    className,
    style,
  }: {
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <div
      className={`w-full bg-slate-900/50 absolute z-[60] backdrop-blur transition-all duration-150 pointer-events-none ${className}`}
      style={style}
    />
  );

  const stepsWithNavbar = [
    "tour-step-navbar-intro",
    "tour-step-pattern-editor-prompt",
    "tour-step-pattern-editor-intro",
    "tour-step-pattern-editor-conclusion",
    "tour-step-adding-pattern-clips",
    "tour-step-switching-clips",
    "tour-step-working-with-poses",
    "tour-step-check-docs",
    "tour-step-saving-work",
    "tour-step-confetti",
  ];
  const onNavbar = stepsWithNavbar.includes(id);
  const top = onNavbar ? NAV_HEIGHT : 0;
  const height = onNavbar ? 0 : NAV_HEIGHT;
  const NavbarBlock = () => {
    return Block({ style: { top, height } });
  };

  const stepsWithTracks = [
    "tour-step-track-intro",
    "tour-step-the-pattern-track",
    "tour-step-the-scale-track",
    "tour-step-track-conclusion",
  ];
  const onTracks = stepsWithTracks.includes(id);
  const stepsWithTimeline = ["tour-step-saving-work", "tour-step-confetti"];
  const onTimeline = stepsWithTimeline.includes(id);
  const BodyBlock = () => {
    const top = onNavbar ? NAV_HEIGHT : 0;
    const left = onTracks ? TRACK_WIDTH : 0;
    const height = onNavbar ? `calc(100vh - ${NAV_HEIGHT}px)` : "100vh";
    const opacity = onTimeline ? 0 : 1;
    return Block({
      style: {
        top,
        left,
        height,
        opacity,
      },
    });
  };

  if (!show) return null;
  return (
    <div className="absolute w-full h-screen inset-0 flex flex-col pointer-events-none animate-in fade-in z-[60]">
      {NavbarBlock()}
      {BodyBlock()}
    </div>
  );
};
