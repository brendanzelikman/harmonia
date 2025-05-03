import { promptUserForTree } from "lib/prompts/tree";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";

export const TutorialRecapitulation = () => {
  const dispatch = useAppDispatch();
  return (
    <div className="flex max-lg:flex-col max-lg:items-center max-lg:overflow-scroll gap-16 p-4 *:shadow-2xl">
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-lg"
        title="Create Trees"
        subtitle="Press N to Input, I for Default"
        stripColor="border-b border-b-indigo-500/80"
        Icon={CreateTreeIcon}
        onClick={() => dispatch(promptUserForTree)}
        description={
          <>
            <div>
              A Tree is a hierarchy of tracks that can create a structure of
              Scales and Samplers.
            </div>
            <div>
              <div>
                <b>Example Project</b>:
              </div>
              <span className="text-teal-400">Tree 3</span> ={" "}
              <span className="text-sky-400">C</span>
              {" => "}
              <span className="text-sky-400">C, D, E, F, G</span>
              {" => "}
              <span className="text-sky-400">C, E, G</span>
              {" => "}
              <span className="text-emerald-400">bass</span>
              <br />
              <span className="text-teal-400">Tree 4</span> ={" "}
              <span className="text-sky-400">e</span>
              {" => "}
              <span className="text-sky-400">e, g, b, d</span>
              {" => "}
              <span className="text-sky-400">e, g, b</span>
              {" => "}
              <span className="text-emerald-400">~file</span>
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
        title="Create Patterns"
        subtitle="Scheduled in a Track"
        stripColor="border-b border-b-teal-500/80"
        Icon={ArrangePatternIcon}
        onClick={() => dispatch(toggleLivePlay())}
        description={
          <>
            <div>
              A Pattern is a sequence of notes that can be defined by Scales and
              played by Samplers.
            </div>

            <div>
              <b>Examples</b>:
              <br />
              <span className="text-sky-400">{`C Major Scale (A)`}</span>
              {" * "}
              <span className="text-emerald-400">{"{ A1 + t1 }"}</span>
              {" = "}
              <span className="text-emerald-400">{"{ C#4 }"}</span>
              <br />
              <span className="text-sky-400">{`C Major Chord (B)`}</span>
              {" * "}
              <span className="text-emerald-400">{"{ B4 }"}</span>
              {" = "}
              <span className="text-emerald-400">{"{ C5 }"}</span>
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
        title="Create Poses"
        subtitle="Scheduled in a Track"
        stripColor="border-b border-b-fuchsia-500/80"
        Icon={ArrangePoseIcon}
        onClick={() => dispatch(toggleLivePlay())}
        description={
          <>
            <div>
              A Pose is a transformation that can change the notes of a Scale or
              a Pattern at any time.
            </div>
            <div>
              <b>Examples</b>:
              <br />
              <span className="text-sky-400">C Major</span> +{" "}
              <span className="text-fuchsia-400">{"<r4, t-1>"}</span> ={" "}
              <span className="text-sky-400">F# Mixolydian</span>
              <br />
              <span className="text-emerald-400">{`{ C4, E4, G4 }`}</span> +{" "}
              <span className="text-fuchsia-400">{"<t6, r-1>"}</span> ={" "}
              <span className="text-emerald-400">{`{ C#4, F#4, A#4 }`}</span>
            </div>
            <div>
              <b>In Practice</b>:<br />
              Poses are used to develop your notes with progressive effects that
              cascade down trees.
            </div>
          </>
        }
      />
    </div>
  );
};
