import Background from "assets/images/landing-background.png";
import classNames from "classnames";
import {
  navbarLiveBackground,
  NavbarLivePlayIcon,
} from "features/Navbar/sections/Toolkit/NavbarLivePlayButton";
import {
  navbarClipBackground,
  NavbarClipIcon,
} from "features/Navbar/sections/Toolkit/NavbarClipButton";
import {
  navbarTrackBackground,
  NavbarTrackIcon,
} from "features/Navbar/sections/Toolkit/NavbarTrackButton";
import { m } from "framer-motion";
import React, { ReactNode, useState } from "react";
import {
  GiFamilyTree,
  GiDominoMask,
  GiPocketRadio,
  GiPaintBrush,
  GiCrystalWand,
  GiPianoKeys,
  GiHand,
  Gi3DStairs,
  GiPalette,
} from "react-icons/gi";

// The timeline starting screen
export function TimelineStart() {
  const [isReady, setIsReady] = useState(false);
  return (
    <div className="flex flex-col items-center pt-24 gap-4 relative size-full bg-slate-900/50 transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10"
        src={Background}
        alt="Background"
      />
      <h1 className="mb-4 text-4xl text-slate-50 font-bold drop-shadow-sm">
        Welcome to the Playground!
      </h1>
      <h2 className="text-2xl text-slate-300">
        The Timeline will be available when you have some tracks.
      </h2>
      <h2 className="text-2xl text-slate-300">
        Here's what you need to know to get started:
      </h2>
      <div className="mt-4 *:text-2xl flex *:gap-8">
        <div className="flex *:font-light *:rounded-lg">
          <Button
            title="Basic Ideas of Harmonia"
            background="bg-gradient-radial from-emerald-900/20 to-sky-800/40"
          >
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={GiDominoMask}
                title="Idea 1: Scales are Structured"
                description="A Scale is a structured collection of notes that can be organized within a hierarchy of pitch classes."
              />
              <Component
                background="bg-emerald-600"
                border="border-emerald-600/60"
                Icon={GiPaintBrush}
                title="Idea 2: Patterns are Rhythmic"
                description="A Pattern is a rhythmic sequence of pitches that can be defined using any Scales as reference."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={GiCrystalWand}
                title="Idea 3: Poses are Expressive"
                description="A Pose refers to any musical effect that can be applied to the notes of a Pattern or Scale."
              />
            </div>
          </Button>
          <Button
            title="Unique Features of Harmonia"
            background="bg-gradient-radial from-emerald-900/20 to-teal-800/40"
          >
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={Gi3DStairs}
                title="Item 1: Scale Tracks are Recursive"
                description="A Scale Track contains a transformable scale that becomes a parent for all of the track's descendants."
              />
              <Component
                background="bg-emerald-700"
                border="border-emerald-600/60"
                Icon={GiPianoKeys}
                title="Item 2: Pattern Tracks are Nestable"
                description="A Pattern Track can play patterns that bind to its inherited scales and adapt to changes in harmony."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={() => <GiFamilyTree className="rotate-180" />}
                title="Item 3: Track Families are Hierarchical"
                description="Clips (Scale, Pattern, or Pose) can be scheduled in a track with cascading effects down the hierarchy."
              />
            </div>
          </Button>
          <Button
            buttonClassName={
              isReady
                ? "bg-gradient-radial animate-in fade-in-80 duration-500 from-fuchsia-500/80 to-sky-950/80"
                : "bg-gradient-radial from-fuchsia-500/50 to-sky-950/50"
            }
            title={isReady ? "Your Journey Awaits!" : "Ready to Start?"}
            onClick={() => setIsReady(true)}
          >
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background={navbarTrackBackground}
                border="border-indigo-600/60"
                Icon={NavbarTrackIcon}
                title="Step 1: Design your Architecture"
                description={`Use this button or press 'N' to create new Tracks in the Timeline by specifying your request in TreeJS.`}
              />
              <Component
                background={navbarClipBackground}
                border="border-emerald-600/60"
                Icon={NavbarClipIcon}
                title="Step 2: Arrange your Composition"
                description="Use this button or press 'A' once you have some Tracks to arrange new Clips in the Timeline."
              />
              <Component
                background={navbarLiveBackground}
                border="border-fuchsia-600/60"
                Icon={NavbarLivePlayIcon}
                title="Step 3: Explore your Possibilities"
                description="Use this button or press 'P' to quickstart a project and equip keyboard shortcuts for Live Play."
              />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

const Button = (props: {
  className?: string;
  buttonClassName?: string;
  background?: string;
  title?: string;
  children: ReactNode;
  onClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={classNames(
        props.className,
        "bg-gradient-radial from-indigo-950/50 to-slate-950/50",
        "max-w-[23.5rem] max-h-max flex flex-col mt-4 backdrop-blur overflow-hidden group border border-slate-600 transition-all duration-1000 text-white"
      )}
    >
      <button
        type="button"
        className={classNames(
          props.buttonClassName,
          props.background ?? "bg-slate-950/50",
          "p-2 cursor-pointer h-12 total-center font-light text-slate-200 border-b border-b-white/20"
        )}
        onClick={() => {
          props.onClick?.();
          setIsOpen((prev) => !prev);
        }}
      >
        {props.title}
      </button>
      <m.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.5 }}
      >
        {props.children}
      </m.div>
    </div>
  );
};

const Component = (props: {
  background: string;
  border: string;
  Icon: React.FC;
  className?: string;
  title: ReactNode;
  description: ReactNode;
}) => (
  <div
    className={classNames(
      props.className,
      props.border,
      "bg-slate-900/50 backdrop-blur-lg size-full flex flex-col gap-1 border p-2 rounded"
    )}
  >
    <div className="font-bold flex gap-2 text-base border-b border-b-white/5">
      <div
        className={classNames(
          props.background,
          "inline-flex *:m-auto p-1 mb-2 rounded-full"
        )}
      >
        <props.Icon />
      </div>
      {props.title}
    </div>{" "}
    <div className="text-sm text-slate-200">{props.description}</div>
  </div>
);
