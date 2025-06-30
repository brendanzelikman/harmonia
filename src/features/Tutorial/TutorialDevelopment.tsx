import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { GiAbacus, GiPineTree } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { tutorialVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";
import { LivePlayIcon } from "features/Navbar/NavbarLivePlay";
import { useAppDispatch } from "hooks/useRedux";
import { growTree } from "types/Timeline/TimelineThunks";

export const TutorialDevelopment = (props: { view: string }) => {
  const dispatch = useAppDispatch();
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
        className="rounded-lg w-84"
        title="Goal: Develop Your Scales"
        stripColor="border-b border-b-indigo-500/80"
        Icon={GiPineTree}
        onClick={() => dispatch(growTree())}
        description={
          <>
            <div>Poses will have cascading effects in Trees.</div>
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
        className="rounded-lg w-84"
        title="Goal: Develop Your Patterns"
        stripColor="border-b border-b-teal-500/80"
        onClick={() => dispatch(growTree())}
        Icon={GiAbacus}
        description={
          <>
            <div>Poses can move notes along multiple axes.</div>
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
              <b>Contrasting Motion:</b>
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
        className="rounded-lg w-84"
        border="ring-fuchsia-600/80"
        title="Goal: Develop With Gestures"
        stripColor="border-b border-b-fuchsia-500/80"
        onClick={() => dispatch(growTree())}
        Icon={() => <LivePlayIcon />}
        description={
          <>
            <div>Poses can be created with shortcuts.</div>
            <div>
              <b>Examples:</b>
              <br />
              <span className="text-sky-400">{"Hold Q/W/E"}</span>
              {" + "}
              <span className="text-violet-400">{"Press 1"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"A1 / B1 / C1"}</span>
              <br />
              <span className="text-sky-400">{"Hold R/T/Y"}</span>
              {" + "}
              <span className="text-violet-400">{"Press -1"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"r-1 / t-1 / y-1"}</span>
              <br />
              <span className="text-sky-400">{"Hold Any"}</span>
              {" + "}
              <span className="text-violet-400">{"Press 0"}</span>
              {" = "}
              <span className="text-fuchsia-400">{"Clear Value (Or All)"}</span>
            </div>
            <div>
              <b>Explanations:</b>
              <br />
              <span className="text-slate-300">
                The full list of Gestures will be available once you have
                created a tree.
              </span>
              <br />
            </div>
          </>
        }
      />
    </m.div>
  );
};
