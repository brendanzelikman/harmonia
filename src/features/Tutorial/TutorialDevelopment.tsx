import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { GiAbacus, GiWireframeGlobe } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { tutorialVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";
import { LivePlayIcon } from "features/Navbar/NavbarLivePlay";

export const TutorialDevelopment = (props: { view: string }) => {
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      data-view={props.view}
      variants={tutorialVariants}
      className="hidden data-[view=development]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Develop Scales"
        subtitle="With Cascading Poses"
        stripColor="border-b border-b-indigo-500/80"
        Icon={GiWireframeGlobe}
        description={
          <>
            <div>Scales can be developed with Poses.</div>
            <div>
              <div>
                <b>Example Tree:</b>
              </div>
              <span className="text-teal-400">Track 1</span> ={" "}
              <span className="text-sky-400">C Major Scale (A)</span>
              <br />
              <span className="text-teal-400">Track 1.1</span> ={" "}
              <span className="text-sky-400">C Major Chord (B)</span>
              <br />
              <span className="text-teal-400">Track 1.1.1</span>
              {" = "}
              <span className="text-sky-400">C Major Third (C)</span>
              <br />
            </div>
            <div>
              If we place <span className="text-fuchsia-400">A1</span> in
              <span className="text-teal-400"> Track 1.1</span>:
              <br />
              <span className="text-teal-400">Track 1</span> ={" "}
              <span className="text-sky-400">C Major Scale (A)</span>
              <br />
              <span className="text-teal-400">Track 1.1</span> ={" "}
              <span className="text-fuchsia-400">D Minor Chord (B)</span>
              <br />
              <span className="text-teal-400">Track 1.1.1</span>
              {" = "}
              <span className="text-fuchsia-400">D Minor Third (C)</span>
              <br />
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-lg"
        title="Develop Patterns"
        subtitle="With Contrasting Motion"
        stripColor="border-b border-b-teal-500/80"
        Icon={GiAbacus}
        description={
          <>
            <div>Patterns can be developed with Poses.</div>
            <div>
              <b>Basic Motion:</b>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<t1>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(Db4, F4, Ab4)"}</span>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<r1>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(E4, G4, C5)"}</span>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<y1>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(C5, E5, G5)"}</span>
            </div>
            <div>
              <b>Voice Leading:</b>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<t5, r-1>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(C4, F4, A4)"}</span>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<t7, r-2>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(B3, D4, G4)"}</span>
              <br />
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
              {" + "}
              <span className="text-fuchsia-400">{"<r3, y-1>"}</span>
              {" = "}
              <span className="text-emerald-400">{"(C4, E4, G4)"}</span>
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
        Icon={() => (
          <LivePlayIcon
            onMouseEnter={() => dispatchOpen("livePlay")}
            onMouseLeave={() => dispatchClose("livePlay")}
          />
        )}
        description={
          <>
            <div>Poses can be created with shortcuts.</div>
            <div>
              <b>Examples:</b>
              <br />
              <span className="text-sky-400">{"Hold Q+W+E"}</span>
              {" + "}
              <span className="text-violet-400">{"Press 1"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"<A1, B1, C1>"}</span>
              <br />
              <span className="text-sky-400">{"Hold R+T+Y"}</span>
              {" + "}
              <span className="text-violet-400">{"Press -2"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"<r-2, t-2, y-2>"}</span>
              <br />
              <span className="text-sky-400">{"Hold Any"}</span>
              {" + "}
              <span className="text-violet-400">{"Press 0"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"Clear Value (Or All)"}</span>
            </div>
            <div>
              <b>Shortcuts:</b>
              <br />
              <span className="text-slate-300">
                For the full list of Keyboard Gestures, hover over the{" "}
                <LivePlayIcon className="inline-flex" /> icon near the top left
                corner of the website.
              </span>
              <br />
            </div>
          </>
        }
      />
    </m.div>
  );
};
