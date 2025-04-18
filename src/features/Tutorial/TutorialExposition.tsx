import { m } from "framer-motion";
import { GiPineTree, GiMusicalNotes, GiCrystalWand } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";

export const TutorialExposition = (props: { view: string }) => {
  return (
    <m.div
      initial="hidden"
      animate="show"
      data-view={props.view}
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
        subtitle="Press N to Create a New Tree"
        stripColor="border-b-indigo-500/80"
        Icon={GiPineTree}
        description={
          <>
            <div>
              A Tree is a family of tracks that forms a hierarchy of Scales and
              Samplers.
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
        Icon={GiCrystalWand}
        description={
          <>
            <div>
              A Pose is a set of effects that can move the notes of a Scale or a
              Pattern.
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
  );
};
