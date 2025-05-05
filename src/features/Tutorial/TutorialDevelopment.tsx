import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { GiChart, GiAbacus, GiHand, GiWireframeGlobe } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { sonataVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";

export const TutorialDevelopment = (props: { view: string }) => {
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      data-view={props.view}
      variants={sonataVariants}
      className="hidden data-[view=development]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Develop Trees"
        subtitle="With Voice Leadings"
        stripColor="border-b border-b-indigo-500/80"
        Icon={GiWireframeGlobe}
        description={
          <>
            <div>
              Trees can be developed by scheduling Poses to explore different
              voice leadings of notes.
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
              <b>By Pitch Lead:</b>
              <br />
              <span className="text-sky-400">{"C Major Chord"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<*E-1>"}</span>
              {" = "}
              <span className="text-sky-400">{"C Minor Chord"}</span>
              <br />
              <span className="text-emerald-400">{"{C4, E4, G4}"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<*C-1, *E-2>"}</span>
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
        stripColor="border-b border-b-teal-500/80"
        Icon={GiAbacus}
        description={
          <>
            <div>
              Patterns can be developed by binding notes with different harmonic
              functions.
            </div>
            <div>
              <b>F as a Chromatic Neighbor (t):</b>
              <br />
              <span className="text-sky-400">{`C Major Chord (B)`}</span>
              {" * "}
              <span className="text-emerald-400">{"{ B2 + t1 }"}</span>
              {" = "}
              <span className="text-emerald-400">{"{ F4 }"}</span>
              <br />
              <span className="text-emerald-400">{`{ C4, E4`}</span>
              <span className="text-cyan-500">{`, F4`}</span>
              <span className="text-emerald-400">{` }`}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<B1>"}</span>
              {" = "}
              <span className="text-emerald-400">{`{E4, G4`}</span>
              <span className="text-cyan-500">{`, Ab4`}</span>
              <span className="text-emerald-400">{` }`}</span>
            </div>
            <div>
              <b>F as a Diatonic Neighbor (A):</b>
              <br />
              <span className="text-sky-400">{`C Major Chord (B)`}</span>
              {" * "}
              <span className="text-emerald-400">{"{ B2 + A1 }"}</span>
              {" = "}
              <span className="text-emerald-400">{"{ F4 }"}</span>
              <br />
              <span className="text-emerald-400">{`{ C4, E4`}</span>
              <span className="text-cyan-500">{`, F4`}</span>
              <span className="text-emerald-400">{` }`}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<B1>"}</span>
              {" = "}
              <span className="text-emerald-400">{`{E4, G4`}</span>
              <span className="text-cyan-500">{`, A4`}</span>
              <span className="text-emerald-400">{` }`}</span>
            </div>
          </>
        }
      />
      <TimelineButton
        className="rounded-lg"
        border="ring-fuchsia-600/80"
        title="Develop Poses"
        subtitle="With Keyboard Gestures"
        stripColor="border-b border-b-fuchsia-500/80"
        Icon={GiHand}
        description={
          <>
            <div>
              Poses can be created and developed with keyboard gestures{" "}
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
              <span className="text-violet-400">{"[r + t + minus + 2]"}</span>
              {" = "}
              <span className="text-fuchsia-400">{" <t-1> "}</span>
              <br />
            </div>
          </>
        }
      />
    </m.div>
  );
};
