import Background from "assets/images/landing-background.png";
import classNames from "classnames";
import { m } from "framer-motion";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import React, { ReactNode, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  GiFamilyTree,
  GiDominoMask,
  GiAudioCassette,
  GiPocketRadio,
  GiPaintBrush,
  GiCrystalWand,
  GiPianoKeys,
  GiHand,
  Gi3DStairs,
} from "react-icons/gi";
import { use } from "types/hooks";
import { selectTransportState } from "types/Transport/TransportSelectors";
import { dispatchCustomEvent } from "utils/html";

// The timeline starting screen
export function TimelineStart() {
  const [isReady, setIsReady] = useState();
  const transportState = use(selectTransportState);
  useCustomEventListener("timelineReady", (e) => setIsReady(e.detail));
  useHotkeys(
    "enter",
    () => transportState && dispatchCustomEvent("timelineReady", true),
    [transportState]
  );
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
                title="Idea 1: Scales can be structured"
                description="A Scale is a static collection of pitch classes that can be organized within a hierarchy of notes."
              />
              <Component
                background="bg-emerald-600"
                border="border-emerald-600/60"
                Icon={GiPaintBrush}
                title="Idea 2: Patterns can be scalar"
                description="A Pattern is a rhythmic sequence of pitches that can be defined using any Scales as reference."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={GiCrystalWand}
                title="Idea 3: Poses can be styled"
                description="A Pose is a dynamic set of transformations that can be applied to the notes of a Pattern or Scale."
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
                title="Scale Tracks are Parents"
                description="A Scale Track contains a unique Scale that can be modified and passed along to its descendants."
              />
              <Component
                background="bg-emerald-700"
                border="border-emerald-600/60"
                Icon={GiPianoKeys}
                title="Pattern Tracks are Children"
                description="A Pattern Track contains a virtual Instrument that can play Patterns built with its parent Scales."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={() => <GiFamilyTree className="rotate-180" />}
                title="All Tracks are Formulated"
                description="Clips of any basic type (Scales, Patterns, Poses) can be scheduled in a Track with cascading effects."
              />
            </div>
          </Button>
          <Button
            buttonClassName={
              isReady
                ? "bg-gradient-radial animate-in fade-in-80 duration-500 from-fuchsia-500/80 to-sky-950/80"
                : "bg-gradient-radial from-fuchsia-500/50 to-sky-950/50"
            }
            title={isReady ? "New Items Unlocked!" : "Ready to Start?"}
            onClick={() => dispatchCustomEvent("timelineReady", !isReady)}
          >
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={GiPocketRadio}
                title="Unlocked Radio!"
                description="Use the Radio to create a family of Scale Tracks by inputting a list of Scales by name or note."
              />
              <Component
                background="bg-emerald-600/60"
                border="border-emerald-600/60"
                Icon={GiAudioCassette}
                title="Unlocked Cassette!"
                description="Use the Cassette to create a Pattern Track by selecting an Instrument from presets or files."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={GiHand}
                title="Unlocked Keyboard!"
                description="Use the Keyboard to quickstart a project and enable track shortcuts for live improvisation."
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
        "max-w-[23rem] max-h-max flex flex-col mt-4 backdrop-blur overflow-hidden group border border-slate-600 transition-all duration-1000 text-white"
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
    <div className="font-bold flex gap-2 border-b border-b-white/5">
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
