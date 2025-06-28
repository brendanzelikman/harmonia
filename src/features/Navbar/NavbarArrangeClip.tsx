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
import { NavbarTitleForm } from "./components/NavbarForm";
import { getHotkeyShortcut } from "lib/hotkeys";

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
            <div className="border-b pt-2 border-slate-500 h-1 w-full mb-2" />
            <div className="flex flex-col gap-1">
              <div className="text-gray-400 text-xs normal-case">
                Press {getHotkeyShortcut(ArrangePatternsHotkey)} to arrange a
                pattern in the timeline.
              </div>
              <div className="text-gray-400 text-xs normal-case">
                Press Z + 1-9 to store a pattern to slot 1-9.
              </div>
              <div className="text-gray-400 text-xs normal-case">
                Press X + 1-9 to load a pattern from slot 1-9.
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
            <div className="border-b pt-2 border-slate-500 h-1 w-full mb-2" />
            <div className="flex flex-col gap-1">
              <div className="text-gray-400 text-xs normal-case">
                Press {getHotkeyShortcut(ArrangePosesHotkey)} to arrange a pose
                in the timeline.
              </div>
              <div className="text-gray-400 text-xs normal-case">
                Press V + 1-9 to store a pose to slot 1-9.
              </div>
              <div className="text-gray-400 text-xs normal-case">
                Press B + 1-9 to load a pose from slot 1-9.
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
