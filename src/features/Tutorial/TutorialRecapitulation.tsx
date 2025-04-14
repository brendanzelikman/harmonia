import { promptUserForTree } from "lib/prompts/tree";
import { GiPineTree, GiMusicalNotes, GiCrystalWand } from "react-icons/gi";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";

export const TutorialRecapitulation = () => {
  const dispatch = useAppDispatch();
  return (
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
              Create a Tree by clicking the button and typing your request in
              the pop-up menu.
            </div>
            <div>
              <b className="text-sky-500">Editing Scales:</b> <br />
              Scales will have a button on the track to change their notes with
              a pop-up menu.
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
              Select a duration and play a note on the keyboard to write to the
              Pattern.
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
              Create a Pose and click on its Header to open its dropdown editor
              menu.
            </div>
            <div>
              <b className="text-sky-500">Change Scales</b>:<br />
              Work with Modulation, Transposition, and Pitch Shift to transform
              Scale Notes.
            </div>
            <div>
              <b className="text-emerald-500">Change Patterns</b>:<br />
              Use Pattern Effects for miscellaneous transformations to Pattern
              Notes.
            </div>
          </>
        }
      />
    </div>
  );
};
