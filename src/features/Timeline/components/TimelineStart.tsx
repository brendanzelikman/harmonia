import Background from "assets/images/background.png";
import classNames from "classnames";
import React, { ReactNode, useEffect, useState } from "react";
import {
  GiPineTree,
  GiCrystalWand,
  GiMusicalNotes,
  GiMoebiusTriangle,
  GiAbacus,
  GiChart,
  GiMusicalScore,
  GiSoundWaves,
  GiMove,
} from "react-icons/gi";
import { dispatchClose, dispatchOpen } from "hooks/useToggle";
import { BiCodeCurly } from "react-icons/bi";
import { m } from "framer-motion";
import { useDispatch } from "types/hooks";
import { promptUserForTree } from "utils/tree";

export function TimelineStart() {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      setTimeout(() => dispatchClose("livePlay"), 50);
    };
  }, []);
  const [view, setView] = useState("exposition");

  const [visited, setVisited] = useState<Record<string, boolean>>({
    exposition: true,
    development: false,
    recapitulation: false,
    coda: false,
  });
  const visit = (view: string) => {
    setView(view);
    if (!visited[view]) setVisited((prev) => ({ ...prev, [view]: true }));
  };

  return (
    <div className="size-full flex flex-col lg:items-center max-lg:px-10 gap-10 pt-12 relative bg-slate-900/50 transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10 animate-background"
        src={Background}
        alt="Background"
      />
      <m.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          type: "spring",
          bounce: 1,
          stiffness: 120,
          mass: 1,
        }}
        className="bg-gradient-radial from-slate-900/80 to-slate-950/70 backdrop-blur-lg select-none text-center px-10 py-5 max-lg:py-4 border-2 border-sky-600 rounded-2xl"
      >
        <div className="mb-4 max-lg:mb-1 text-4xl max-lg:text-2xl text-slate-100 font-bold drop-shadow-sm">
          Welcome to the Playground!
        </div>
        <div className="text-2xl flex gap-2 justify-center max-lg:text-lg font-normal text-slate-300">
          <div
            data-active={view === "exposition"}
            data-visited={visited.exposition}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("exposition")}
          >
            Exposition
          </div>
          {" • "}
          <div
            data-active={view === "development"}
            data-visited={visited.development}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("development")}
          >
            Development
          </div>
          {" • "}
          <div
            data-active={view === "recapitulation"}
            data-visited={visited.recapitulation}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("recapitulation")}
          >
            Recapitulation
          </div>
          {" • "}
          <div
            data-active={view === "coda"}
            data-visited={visited.coda}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("coda")}
          >
            Coda
          </div>
        </div>
      </m.div>

      <m.div
        initial="hidden"
        animate="show"
        data-view={view}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          show: {
            opacity: 1,
            scale: 1,
            transition: {
              delayChildren: 0.25,
              staggerChildren: 0.1,
              type: "spring",
              mass: 0.5,
              stiffness: 50,
            },
          },
        }}
        className="hidden data-[view=exposition]:flex max-lg:flex-col max-lg:items-center max-lg:overflow-scroll gap-16 p-4 *:shadow-2xl"
      >
        <TimelineButton
          border="ring-indigo-600/80"
          className="rounded-lg"
          title="Create Tree"
          subtitle="Press I to Input, N for Default"
          stripColor="border-b-indigo-500/80"
          Icon={GiPineTree}
          description={
            <>
              <div>
                A Tree is a family of tracks that forms a hierarchy of Scales
                and Samplers.
              </div>
              <div>
                <div>
                  <b>Examples</b>:
                </div>
                <span className="text-sky-400">C Major Scale</span>
                {" => "}
                <span className="text-sky-400">C Major Chord</span>

                <br />
                <span className="text-sky-400">Dm11</span>
                {" => "}
                <span className="text-sky-400">Dm7</span>
                {" => "}
                <span className="text-emerald-400">(Piano + Bass)</span>
              </div>
              <div>
                <b>In Practice</b>:<br />
                Trees are used to organize your notes
                <br /> into multiple layers of information.
              </div>
            </>
          }
        />
        <TimelineButton
          border="ring-teal-600/80"
          className="rounded-lg"
          title="Create Pattern"
          subtitle="Scheduled in a Track"
          stripColor="border-b-teal-500/80"
          Icon={GiMusicalNotes}
          description={
            <>
              <div>
                A Pattern is a sequence of notes that can be based on the Scales
                of a Sampler.
              </div>

              <div>
                <b>Examples</b>:
                <br />
                <span className="text-sky-400">{`C Major Scale`}</span>
                {" * "}
                <span className="text-emerald-400">{"{ step: 1 }"}</span>
                {" = "}
                <span className="text-emerald-400">{"{ C4 }"}</span>
                <br />
                <span className="text-sky-400">{`C Major Chord`}</span>
                {" * "}
                <span className="text-emerald-400">{"{ step: 1 + t1 }"}</span>
                {" = "}
                <span className="text-emerald-400">{"{ C#4 }"}</span>
              </div>
              <div>
                <b>In Practice</b>:<br />
                Patterns are used to express your notes as melodies, harmonies,
                and rhythms.
              </div>
            </>
          }
        />
        <TimelineButton
          className="rounded-lg"
          border="ring-fuchsia-600/80"
          title="Create Pose"
          subtitle="Scheduled in a Track"
          stripColor="border-b-fuchsia-500/80"
          Icon={GiMove}
          description={
            <>
              <div>
                A Pose is a set of effects that can move the notes of a Scale or
                a Pattern.
              </div>
              <div>
                <b>Examples</b>:
                <br />
                <span className="text-sky-400">C Major Scale</span> +{" "}
                <span className="text-fuchsia-400">{"<t1>"}</span> ={" "}
                <span className="text-sky-400">Db Major Scale</span>
                <br />
                <span className="text-emerald-400">{`{ C4, E4, G4 }`}</span> +{" "}
                <span className="text-fuchsia-400">{"<r-1>"}</span> ={" "}
                <span className="text-emerald-400">{`{ G3, C4, E4 }`}</span>
              </div>
              <div>
                <b>In Practice</b>:<br />
                Poses are used to transform your notes with cumulative effects
                over time.
              </div>
            </>
          }
        />
      </m.div>
      {view === "development" && (
        <div className="flex max-lg:flex-col max-lg:items-center max-lg:overflow-scroll gap-16 p-4 *:shadow-2xl">
          <TimelineButton
            border="ring-indigo-600/80"
            className="rounded-lg"
            title="Develop Trees"
            subtitle="With Voice Leadings"
            stripColor="border-b-indigo-500/80"
            Icon={GiChart}
            description={
              <>
                <div>
                  Trees can be developed by scheduling Poses to explore
                  different voice leadings.
                </div>
                <div>
                  <b>By Transposition:</b>
                  <br />
                  <span className="text-sky-400">{"C Major Scale"}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<t3, r-2>"}</span>
                  {" = "}
                  <span className="text-sky-400">{"C Minor Scale"}</span>
                  <br />
                  <span className="text-emerald-400">{"{C4, E4, G4}"}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<t7, r-2>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{"{ B3, D4, G4 }"}</span>
                </div>
                <div>
                  <b>By Pitch Shift:</b>
                  <br />
                  <span className="text-sky-400">{"C Major Chord"}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<E-1>"}</span>
                  {" = "}
                  <span className="text-sky-400">{"C Minor Chord"}</span>
                  <br />
                  <span className="text-emerald-400">{"{C4, E4, G4}"}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<C-1, E-2>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{"{B4, D4, G4}"}</span>
                </div>
              </>
            }
          />
          <TimelineButton
            border="ring-teal-600/80"
            className="rounded-lg"
            title="Develop Patterns"
            subtitle="With Harmonic Functions"
            stripColor="border-b-teal-500/80"
            Icon={GiAbacus}
            description={
              <>
                <div>
                  Patterns can be developed by changing the harmonic functions
                  of their notes.
                </div>
                <div>
                  <b>F as a Chromatic Neighbor:</b>
                  <br />
                  <span className="text-emerald-400">{`{ G, C, E`}</span>
                  <span className="text-cyan-500">{`, F`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<r1>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{`{ C, E, G`}</span>
                  <span className="text-cyan-500">{`, Ab`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  <br />
                  <span className="text-emerald-400">{`{ G, C, E`}</span>
                  <span className="text-cyan-500">{`, F`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<r2>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{`{ E, G, C`}</span>
                  <span className="text-cyan-500">{`, Db`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                </div>
                <div>
                  <b>F as a Diatonic Neighbor:</b>
                  <br />
                  <span className="text-emerald-400">{`{ G, C, E`}</span>
                  <span className="text-cyan-500">{`, F`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<r1>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{`{ C, E, G`}</span>
                  <span className="text-cyan-500">{`, A`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  <br />
                  <span className="text-emerald-400">{`{ G, C, E`}</span>
                  <span className="text-cyan-500">{`, F`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                  {" + "}
                  <span className="text-fuchsia-400">{"<r2>"}</span>
                  {" = "}
                  <span className="text-emerald-400">{`{ E, G, C`}</span>
                  <span className="text-cyan-500">{`, D`}</span>
                  <span className="text-emerald-400">{` }`}</span>
                </div>
              </>
            }
          />
          <TimelineButton
            className="rounded-lg"
            border="ring-fuchsia-600/80"
            title="Develop Poses"
            subtitle="With Keyboard Shortcuts"
            stripColor="border-b-fuchsia-500/80"
            Icon={GiMoebiusTriangle}
            description={
              <>
                <div>
                  Poses can be created and updated with keyboard shortcuts{" "}
                  <span
                    className="text-fuchsia-200 hover:opacity-85"
                    onMouseEnter={() => dispatchOpen("livePlay")}
                    onMouseLeave={() => dispatchClose("livePlay")}
                  >
                    (hover for details)
                  </span>
                  .
                </div>
                <div>
                  <b>Creating Poses by Shortcut:</b>
                  <br />
                  <span className="text-sky-400">{"C Major Scale "}</span>
                  {" + "}
                  <span className="text-violet-400">{"[t + 1]"}</span>
                  {" = "}
                  <span className="text-sky-400">{"Db Major Scale"}</span>
                  <br />
                  <span className="text-emerald-400">{"{ C4, E4, G4 }"}</span>
                  {" + "}
                  <span className="text-violet-400">{"[r + 1]"}</span>
                  {" = "}
                  <span className="text-emerald-400">{"{ E4, G4, C5 }"}</span>
                  <br />
                </div>
                <div>
                  <b>Updating Poses by Shortcut:</b>
                  <br />
                  <span className="text-fuchsia-400">{" <t1, r2> "}</span>
                  {" + "}
                  <span className="text-violet-400">{"[t + 2]"}</span>
                  {" = "}
                  <span className="text-fuchsia-400">{" <t3, r2> "}</span>
                  <br />
                  <span className="text-fuchsia-400">{" <t1, r2> "}</span>
                  {" + "}
                  <span className="text-violet-400">
                    {"[r + t + minus + 2]"}
                  </span>
                  {" = "}
                  <span className="text-fuchsia-400">{" <t-1> "}</span>
                  <br />
                </div>
              </>
            }
          />
        </div>
      )}
      {view === "recapitulation" && (
        <div className="flex max-lg:flex-col max-lg:items-center max-lg:overflow-scroll gap-16 p-4 *:shadow-2xl">
          <TimelineButton
            border="ring-indigo-600/80"
            className="rounded-lg"
            title="Create Trees"
            subtitle="Press I to Input, N for Default"
            stripColor="border-b-indigo-500/80"
            Icon={GiPineTree}
            onClick={() => dispatch(promptUserForTree)}
            description={
              <>
                <div>
                  Create a Tree by clicking the button and typing your request
                  in the pop-up menu.
                </div>
                <div>
                  <b className="text-sky-500">Editing Scales:</b> <br />
                  Scales will have a button on the track to change their notes
                  with a pop-up menu.
                </div>
                <div>
                  <b className="text-emerald-500">Editing Samplers:</b> <br />
                  Samplers will have a button on the track to change their
                  instrument with an editor.
                </div>
              </>
            }
          />
          <TimelineButton
            border="ring-teal-600/80"
            className="rounded-lg"
            title="Create Patterns"
            subtitle="Scheduled in a Track"
            stripColor="border-b-teal-500/80"
            Icon={GiMusicalNotes}
            description={
              <>
                <div>
                  Create a Pattern and click on its Header to open its dropdown
                  editor menu.
                </div>
                <div>
                  <b className="text-sky-500">Write Notes:</b> <br />
                  Select a duration and play a note on the keyboard to write to
                  the Pattern.
                </div>
                <div>
                  <b className="text-emerald-500">Bind Notes:</b> <br />
                  Select a binding and schedule a Pose to see how it affects the
                  motion of the note.
                </div>
              </>
            }
          />
          <TimelineButton
            className="rounded-lg"
            border="ring-fuchsia-600/80"
            title="Create Poses"
            subtitle="Scheduled in a Track"
            stripColor="border-b-fuchsia-500/80"
            Icon={GiCrystalWand}
            description={
              <>
                <div>
                  Create a Pose and click on its Header to open its dropdown
                  editor menu.
                </div>
                <div>
                  <b className="text-sky-500">Change Scales</b>:<br />
                  Work with Modulation, Transposition, and Pitch Shift to
                  transform Scale Notes.
                </div>
                <div>
                  <b className="text-emerald-500">Change Patterns</b>:<br />
                  Use Pattern Effects for miscellaneous transformations to
                  Pattern Notes.
                </div>
              </>
            }
          />
        </div>
      )}
      {view === "coda" && (
        <div className="flex max-lg:flex-col max-lg:items-center max-lg:overflow-scroll gap-16 p-4 *:shadow-2xl">
          <TimelineButton
            border="ring-indigo-600/80"
            className="rounded-lg"
            title="Save Project Data"
            subtitle="Export to JSON File"
            stripColor="border-b-indigo-500/80"
            Icon={BiCodeCurly}
            description={
              <>
                <div>
                  Projects are autosaved in your browser and stored in a native
                  JSON format.
                </div>
                <div>
                  <b>Diary:</b>
                  <br />
                  Open Diary from the Settings Menu to store metadata about your
                  project.
                </div>
                <div>
                  <b>Terminal:</b>
                  <br />
                  Open Terminal from the Settings Menu to directly edit the JSON
                  of your project.
                </div>
              </>
            }
          />
          <TimelineButton
            border="ring-teal-600/80"
            className="rounded-lg"
            title="Save Note Data"
            subtitle="Export to MIDI File"
            stripColor="border-b-teal-500/80"
            Icon={GiMusicalScore}
            description={
              <>
                <div>
                  Note data can be saved to MIDI files for use in other music
                  notation programs.
                </div>
                <div>
                  <b>Entire Project:</b>
                  <br />
                  Open the Project Menu (Compact Disc) and press Export to MIDI.
                </div>
                <div>
                  <b>Selected Patterns:</b>
                  <br />
                  Right click to open the context menu, then press Selection and
                  Export to MIDI.
                </div>
              </>
            }
          />
          <TimelineButton
            border="ring-fuchsia-600/80"
            className="rounded-lg"
            title="Save Audio Data"
            subtitle="Export to WAV File"
            stripColor="border-b-fuchsia-400/80"
            Icon={GiSoundWaves}
            description={
              <>
                <div>
                  Audio data can be saved to WAV files for playback, sampling,
                  and sharing.
                </div>
                <div>
                  <b>Entire Project:</b>
                  <br />
                  Open the Project Menu (Compact Disc) and press Export to WAV.
                </div>
                <div>
                  <b>Live Session:</b>
                  <br />
                  Click Record to start capturing audio, then again to download
                  your playback.
                </div>
              </>
            }
          />
        </div>
      )}
    </div>
  );
}

const TimelineButton = (
  props: Partial<{
    background: string;
    border: string;
    stripColor: string;
    Icon: React.FC;
    onClick: () => void;
    className: string;
    title: ReactNode;
    subtitle: ReactNode;
    description: ReactNode;
  }>
) => (
  <m.div
    variants={{
      hidden: { opacity: 0, scale: 0.5 },
      show: { opacity: 1, scale: 1 },
    }}
    className={classNames(
      props.className,
      props.border,
      props.background ??
        "bg-gradient-radial from-slate-800/80 to-slate-950/50",
      "hover:ring-4 backdrop-blur-lg transition-all duration-300 cursor-pointer w-full max-w-xl items-center flex flex-col gap-1 ring-2 p-6 rounded select-none"
    )}
    onClick={props.onClick}
  >
    {props.Icon && (
      <div className="text-8xl">
        <props.Icon />
      </div>
    )}
    <div
      className={classNames(
        props.stripColor ?? "border-b-slate-50/5",
        "font-bold flex-center gap-2 text-base w-full pb-1 border-b"
      )}
    >
      <div className="flex flex-col items-center mt-2 mb-1">
        <div className="font-bold text-slate-50 text-xl">{props.title}</div>
        <div className="font-light text-slate-400 capitalize">
          ({props.subtitle})
        </div>
      </div>
    </div>
    <div className="flex justify-evenly items-center p-2 max-xl:flex-wrap text-sm text-slate-200">
      <div className="grow flex flex-col p-1 gap-4 w-[17rem]">
        {props.description}
      </div>
    </div>
  </m.div>
);
