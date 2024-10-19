import Background from "assets/images/landing-background.png";
import classNames from "classnames";
import React, { ReactNode } from "react";
import {
  GiFamilyTree,
  GiDominoMask,
  GiAudioCassette,
  GiPocketRadio,
  GiPaintBrush,
  GiCrystalWand,
  GiPianoKeys,
  GiDatabase,
  GiHand,
} from "react-icons/gi";

// The timeline starting screen
export function TimelineStart() {
  return (
    <div className="flex flex-col gap-4 relative size-full bg-slate-900/50 total-center transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10"
        src={Background}
        alt="Background"
      />
      <h1 className="mb-4 text-4xl text-slate-50 font-bold drop-shadow-sm">
        Welcome to the Playground!
      </h1>
      <h2 className="text-2xl text-slate-300">
        The Timeline will be available once you have some tracks.
      </h2>
      <h2 className="text-2xl text-slate-300">
        Here's what you need to know to get started:
      </h2>
      <div className="mt-4 *:text-2xl flex *:gap-8">
        <div className="flex *:font-light *:rounded-lg">
          <Button title="Musical Ideas">
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={GiDominoMask}
                title="Idea 1: Scale"
                description="A group of pitch classes that can organize collections of music and specify harmony."
              />
              <Component
                background="bg-emerald-600"
                border="border-emerald-600/60"
                Icon={GiPaintBrush}
                title="Idea 2: Pattern"
                description="A sequence of pitches that can be bound to a Scale and specify rhythm and dynamics."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={GiCrystalWand}
                title="Idea 3: Pose"
                description="A transformation that can be applied to a Scale or Pattern when placed in a track."
              />
            </div>
          </Button>
          <Button title="Recursive Tracks">
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={GiDatabase}
                title="Scale Track"
                description="Contains a unique Scale and can create nested tracks inheriting its properties."
              />
              <Component
                background="bg-emerald-700"
                border="border-emerald-600/60"
                Icon={GiPianoKeys}
                title="Pattern Track"
                description="Contains a unique Instrument that can play audio and migrate to other tracks."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={() => <GiFamilyTree className="rotate-180" />}
                title="Track Tree"
                description="Contains a family of nested tracks that can have Clips scheduled for playback."
              />
            </div>
          </Button>
          <Button title="Starting Points">
            <div className="flex flex-col gap-4 p-4 text-lg items-center">
              <Component
                background="bg-indigo-600"
                border="border-indigo-600/60"
                Icon={GiPocketRadio}
                title="Unlocked Radio!"
                description="Use the Radio to design a new family of nested tracks or edit a Scale Track."
              />
              <Component
                background="bg-emerald-600/60"
                border="border-emerald-600/60"
                Icon={GiAudioCassette}
                title="Unlocked Cassette!"
                description="Use the Cassette to create or edit a Pattern Track with a new virtual instrument."
              />
              <Component
                background="bg-fuchsia-600/60"
                border="border-fuchsia-600/60"
                Icon={GiHand}
                title="Unlocked Keyboard!"
                description="Use the Keyboard to enable shortcuts for easily transposing Tracks and Clips."
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
  title?: string;
  children: ReactNode;
}) => (
  <div
    className={classNames(
      props.className,
      "w-80 flex flex-col mt-4 backdrop-blur bg-slate-950/50 overflow-hidden group border border-slate-600 transition-all text-white"
    )}
  >
    <div className="p-2 h-12 total-center font-light text-slate-200 bg-slate-950/50 border-b border-b-white/20">
      {props.title}
    </div>
    {props.children}
  </div>
);

const Component = (props: {
  background: string;
  border: string;
  Icon: React.FC;

  title: ReactNode;
  description: ReactNode;
}) => (
  <div
    className={classNames(
      props.border,
      "bg-slate-500/5 backdrop-blur size-full flex flex-col gap-1 border p-2  rounded"
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
