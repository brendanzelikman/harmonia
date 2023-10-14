import { Transition } from "@headlessui/react";
import { TRACK_WIDTH } from "appConstants";
import { NAV_HEIGHT } from "features/Navbar";
import { selectRootTour } from "redux/Root";
import { useAppSelector } from "redux/hooks";

// Onboarding tour background
export const TourBackground = () => {
  const { show, id } = useAppSelector(selectRootTour);

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
    "tour-step-adding-clips",
    "tour-step-adding-transpositions",
    "tour-step-track-media",
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
  const stepsWithTimeline = [
    "tour-step-track-media",
    "tour-step-saving-work",
    "tour-step-confetti",
  ];
  const onTimeline = stepsWithTimeline.includes(id);
  const stepsWithEditor = [
    "tour-step-pattern-editor-intro",
    "tour-step-pattern-editor-conclusion",
  ];
  const onEditor = stepsWithEditor.includes(id);
  const BodyBlock = () => {
    const top = NAV_HEIGHT;
    const left = onTracks ? TRACK_WIDTH : onEditor ? undefined : 0;
    const right = onEditor ? `calc(100vw - ${TRACK_WIDTH}px)` : 0;
    const height = `calc(100% - ${NAV_HEIGHT}px)`;
    const opacity = onTimeline ? 0 : 1;
    const transition = onEditor ? "none" : undefined;
    return Block({
      style: {
        top,
        left,
        right,
        height,
        opacity,
        transition,
      },
    });
  };

  return (
    <Transition
      show={show}
      className="absolute w-full h-screen flex flex-col pointer-events-none"
    >
      {NavbarBlock()}
      {BodyBlock()}
    </Transition>
  );
};
