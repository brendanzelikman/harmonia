import { promptUserForTree } from "lib/prompts/tree";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import { tutorialVariants } from "./TutorialIntroduction";
import { m } from "framer-motion";

export const TutorialRecapitulation = (props: { view: string }) => {
  const dispatch = useAppDispatch();
  return (
    <m.div
      initial="hidden"
      whileInView="show"
      data-view={props.view}
      variants={tutorialVariants}
      className="hidden data-[view=recapitulation]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Create Tree"
        subtitle="Press N to Input, G to Grow"
        stripColor="border-b border-b-indigo-500/80"
        Icon={CreateTreeIcon}
        onClick={() => dispatch(promptUserForTree)}
        description={
          <>
            <div>
              A Tree is a hierarchy of tracks grouped into Scales (branches) and
              Samplers (leaves).
            </div>
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
              <span className="text-teal-400">Track 1.1.1</span> ={" "}
              <span className="text-emerald-400">Upright Piano (C)</span>
              <br />
            </div>
            <div>
              <b>In Practice</b>:<br />
              Trees are used to organize your notes into multiple layers of
              harmonic information.
            </div>
          </>
        }
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-lg"
        title="Create Pattern"
        subtitle="Scheduled in a Track"
        stripColor="border-b border-b-teal-500/80"
        Icon={ArrangePatternIcon}
        onClick={() => dispatch(toggleLivePlay())}
        description={
          <>
            <div>
              A Pattern is a sequence of pitches that can be written using the
              Scales of a Tree.
            </div>

            <div>
              <b>Example Pattern</b>:
              <br />
              <span className="text-teal-400">{`In Track 1.1.1`},</span>
              <span className=""> the pitches </span>
              <span className="text-emerald-400">{" E4 => F#4 => G4"}</span>
              <br />
              <span className="">{`will autobind to `}</span>
              <span className="text-emerald-400">
                {" {B2} => {B3 + t-1} => {B3}"}
              </span>
              <br />
              <span className="">{" with"}</span>
              <span className="text-emerald-400">{" {B3 + t-1} "}</span>
              <span>{" = "}</span>
              <span className="text-sky-400">
                {" Step 3 of B, -1 semitone"}.
              </span>
            </div>
            <div>
              <b>In Practice</b>:<br />
              Patterns are used to schedule the notes that you want to hear
              sounded out in your piece.
            </div>
          </>
        }
      />
      <TimelineButton
        className="rounded-lg"
        border="ring-fuchsia-600/80"
        title="Create Pose"
        subtitle="Scheduled in a Track"
        stripColor="border-b border-b-fuchsia-500/80"
        Icon={ArrangePoseIcon}
        onClick={() => dispatch(toggleLivePlay())}
        description={
          <>
            <div>
              A Pose is a multidimensional transformation that can move a note
              along your Scales.
            </div>
            <div>
              <b>Example Pose</b>:
              <br />
              <span className="text-teal-400">{`In Track 1.1.1`},</span>
              <span className=""> the transposition </span>
              <span className="text-fuchsia-300">{" <B-2, r2> "}</span>
              <br />
              <span className="">{" will move "}</span>
              <span className="text-emerald-400">{" E4, F#4, G4"}</span>
              <span>{" to "}</span>
              <span className="text-emerald-400">{"C4, G4, B4"}</span>
              {" by"}
              <br />
              <span className="text-fuchsia-300">{"2 steps down Scale B"}</span>
              {" and "}
              <span className="text-fuchsia-300">{" 2 rotations up"}.</span>
            </div>
            <div>
              <b>In Practice</b>:<br />
              Poses are used to develop your notes with progressive effects that
              can be reused.
            </div>
          </>
        }
      />
    </m.div>
  );
};
