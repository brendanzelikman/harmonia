import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  ArrangePatternIcon,
  ArrangePatternsHotkey,
  ArrangePoseIcon,
  ArrangePosesHotkey,
} from "lib/hotkeys/timeline";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  selectIsAddingClips,
  selectStoredPatterns,
  selectStoredPoses,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  DEFAULT_TRACK_PROMPT,
  toggleAddingState,
} from "types/Timeline/TimelineThunks";
import { createTreeFromString } from "lib/prompts/tree";
import { NavbarFormGroup, NavbarTitleForm } from "./components/NavbarForm";
import { getHotkeyShortcut } from "lib/hotkeys";
import { GiSave, GiPlateClaw } from "react-icons/gi";

export const NavbarArrangePatterns = () => {
  const dispatch = useAppDispatch();
  const type = useAppValue(selectTimelineType);
  const isAdding = useAppValue(selectIsAddingClips);
  const active = isAdding && type === "pattern";
  const hotkey = ArrangePatternsHotkey;
  const hasTracks = useAppValue(selectHasTracks);
  const storedPatterns = useAppValue(selectStoredPatterns);
  const hasStorage = storedPatterns.some((p) => !!p);
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      disabled={!hasTracks}
      className={classNames(
        "bg-radial border border-teal-400 from-teal-900 to-teal-500 ring-teal-400",
        !hasTracks ? "opacity-50" : "",
        active ? "ring-2 ring-offset-2 ring-offset-black" : ""
      )}
      borderColor="border-teal-400"
      label={
        !hasTracks ? (
          <span className="text-teal-400">Create Tree to Create Pattern</span>
        ) : (
          <div className="py-2 min-w-48">
            <NavbarTitleForm
              className="mb-3"
              value="Pattern - Musical Passage"
            />
            <div className="text-emerald-400 px-2 text-sm">
              Design Sequences of Notes
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-sky-500">
                  <div>Create Pattern</div>
                  <ArrangePatternIcon className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press {getHotkeyShortcut(ArrangePatternsHotkey)} to arrange a
                  pattern in the timeline.
                </div>
              </div>
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-emerald-500">
                  <div>Store Pattern</div>
                  <GiSave className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press Z + 1-9 to store a pattern to slot 1-9.
                </div>
              </div>
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-fuchsia-500">
                  <div>Load Pattern</div>
                  <GiPlateClaw className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press X + 1-9 to load a pattern from slot 1-9.
                </div>
              </div>
            </div>
            {hasStorage && (
              <div className="flex justify-evenly py-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
                  <ArrangePatternIcon
                    key={key}
                    className={
                      !!storedPatterns[key - 1]
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )
      }
      hotkey={hotkey}
      onClick={() =>
        !hasTracks
          ? dispatch(createTreeFromString({ data: DEFAULT_TRACK_PROMPT }))
          : dispatch(toggleAddingState({ data: "pattern" }))
      }
    >
      <ArrangePatternIcon className="text-2xl " />
    </NavbarTooltipButton>
  );
};

export const NavbarArrangePoses = () => {
  const dispatch = useAppDispatch();
  const type = useAppValue(selectTimelineType);
  const isAdding = useAppValue(selectIsAddingClips);
  const active = isAdding && type === "pose";
  const hasTracks = useAppValue(selectHasTracks);
  const storedPoses = useAppValue(selectStoredPoses);
  const hasStorage = storedPoses.some((p) => !!p);
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      disabled={!hasTracks}
      className={classNames(
        "bg-radial border border-fuchsia-500 from-fuchsia-800 to-fuchsia-600 ring-fuchsia-400",
        !hasTracks ? "opacity-50" : "",
        active ? "ring-2 ring-offset-2 ring-offset-black" : ""
      )}
      borderColor="border-fuchsia-500"
      label={
        !hasTracks ? (
          <span className="text-fuchsia-400">Create Tree to Create Pose</span>
        ) : (
          <div className="py-2 min-w-48">
            <NavbarTitleForm className="mb-3" value="Pose - Musical Function" />
            <div className="text-fuchsia-400 px-2 text-sm">
              Design Transformations of Notes
            </div>
            <div className="flex flex-col mt-3 gap-2">
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-sky-500">
                  <div>Create Pose</div>
                  <ArrangePoseIcon className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press {getHotkeyShortcut(ArrangePosesHotkey)} to arrange a
                  pose in the timeline.
                </div>
              </div>
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-emerald-500">
                  <div>Store Pose</div>
                  <GiSave className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press V + 1-9 to store a pose to slot 1-9.
                </div>
              </div>
              <div className="border border-slate-500 rounded">
                <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-fuchsia-500">
                  <div>Load Pose</div>
                  <GiPlateClaw className="ml-auto text-2xl" />
                </NavbarFormGroup>
                <div className="text-xs p-1.5 normal-case text-slate-400">
                  Press B + 1-9 to load a pose from slot 1-9.
                </div>
              </div>
            </div>
            {hasStorage && (
              <div className="flex justify-evenly py-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
                  <ArrangePoseIcon
                    key={key}
                    className={
                      !!storedPoses[key - 1]
                        ? "text-fuchsia-300"
                        : "text-slate-500"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )
      }
      hotkey={ArrangePosesHotkey}
      onClick={() =>
        !hasTracks
          ? dispatch(createTreeFromString({ data: DEFAULT_TRACK_PROMPT }))
          : dispatch(toggleAddingState({ data: "pose" }))
      }
    >
      <ArrangePoseIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
