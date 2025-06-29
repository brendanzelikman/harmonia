import {
  ArrangePatternIcon,
  ArrangePatternsHotkey,
  ArrangePoseIcon,
  ArrangePosesHotkey,
} from "lib/hotkeys/timeline";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  selectStoredPatterns,
  selectStoredPoses,
} from "types/Timeline/TimelineSelectors";
import {
  DEFAULT_TRACK_PROMPT,
  toggleAddingState,
} from "types/Timeline/TimelineThunks";
import { createTreeFromString } from "lib/prompts/tree";
import { getHotkeyShortcut } from "lib/hotkeys";
import { GiSave, GiPlateClaw } from "react-icons/gi";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";
import {
  removePatternFromStorage,
  removePoseFromStorage,
} from "types/Timeline/TimelineSlice";

export const NavbarArrangePatterns = () => {
  const dispatch = useAppDispatch();
  const hasTracks = useAppValue(selectHasTracks);
  const storedPatterns = useAppValue(selectStoredPatterns);
  const hasStorage = storedPatterns.some((p) => !!p);
  const shortcut = getHotkeyShortcut(ArrangePatternsHotkey);
  return (
    <NavbarActionButton
      title="Pattern (Musical Passage)"
      subtitle="Design Sequences of Notes"
      subtitleClass="text-emerald-400"
      Icon={<ArrangePatternIcon className="text-2xl" />}
      background="bg-radial from-teal-900 to-teal-500"
      borderColor="border-teal-400"
      onClick={() => dispatch(toggleAddingState({ data: "pattern" }))}
    >
      <NavbarActionButtonOption
        className="cursor-pointer"
        title="Create Pattern"
        Icon={<ArrangePatternIcon className="ml-auto text-2xl" />}
        subtitle={`Press ${shortcut} to arrange a pattern in the timeline.`}
        onClick={() =>
          !hasTracks
            ? dispatch(createTreeFromString({ data: DEFAULT_TRACK_PROMPT }))
            : dispatch(toggleAddingState({ data: "pattern" }))
        }
        stripe="border-b-sky-500"
      />
      <NavbarActionButtonOption
        title="Store Pattern"
        Icon={<GiSave className="ml-auto text-2xl" />}
        subtitle="Press Z + 1-9 to store a pattern to slot 1-9."
        stripe="border-b-emerald-500"
        readOnly
      />
      <NavbarActionButtonOption
        title="Load Pattern"
        Icon={<GiPlateClaw className="ml-auto text-2xl" />}
        subtitle="Press X + 1-9 to load a pattern from slot 1-9."
        stripe="border-b-fuchsia-500"
        readOnly
      />
      {hasStorage && (
        <div className="flex justify-evenly py-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
            <ArrangePatternIcon
              key={key}
              className={`cursor-pointer ${
                !!storedPatterns[key - 1]
                  ? "text-emerald-300"
                  : "text-slate-500"
              }`}
              onClick={() =>
                dispatch(removePatternFromStorage({ data: key - 1 }))
              }
            />
          ))}
        </div>
      )}
    </NavbarActionButton>
  );
};

export const NavbarArrangePoses = () => {
  const dispatch = useAppDispatch();
  const hasTracks = useAppValue(selectHasTracks);
  const storedPoses = useAppValue(selectStoredPoses);
  const hasStorage = storedPoses.some((p) => !!p);
  return (
    <NavbarActionButton
      title="Pose (Musical Function)"
      subtitle="Design Transformations of Notes"
      subtitleClass="text-fuchsia-400"
      Icon={<ArrangePoseIcon className="text-2xl" />}
      background="bg-radial from-fuchsia-900 to-fuchsia-500"
      borderColor="border-fuchsia-400"
      onClick={() => dispatch(toggleAddingState({ data: "pose" }))}
    >
      <NavbarActionButtonOption
        title="Create Pose"
        Icon={<ArrangePoseIcon className="ml-auto text-2xl" />}
        subtitle={`Press ${getHotkeyShortcut(
          ArrangePosesHotkey
        )} to arrange a pose in the timeline.`}
        onClick={() =>
          !hasTracks
            ? dispatch(createTreeFromString({ data: DEFAULT_TRACK_PROMPT }))
            : dispatch(toggleAddingState({ data: "pose" }))
        }
        stripe="border-b-sky-500"
      />
      <NavbarActionButtonOption
        title="Store Pose"
        Icon={<GiSave className="ml-auto text-2xl" />}
        subtitle="Press V + 1-9 to store a pose to slot 1-9."
        stripe="border-b-emerald-500"
        readOnly
      />
      <NavbarActionButtonOption
        title="Load Pose"
        Icon={<GiPlateClaw className="ml-auto text-2xl" />}
        subtitle="Press B + 1-9 to load a pose from slot 1-9."
        stripe="border-b-fuchsia-500"
        readOnly
      />
      {hasStorage && (
        <div className="flex justify-evenly py-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
            <ArrangePoseIcon
              key={key}
              className={`cursor-pointer ${
                !!storedPoses[key - 1] ? "text-fuchsia-300" : "text-slate-500"
              }`}
              onClick={() => dispatch(removePoseFromStorage({ data: key - 1 }))}
            />
          ))}
        </div>
      )}
    </NavbarActionButton>
  );
};
