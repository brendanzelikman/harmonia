import classNames from "classnames";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { NavbarTooltipButton } from "../../components";
import { GiHand } from "react-icons/gi";
import { useAuth } from "providers/auth";
import {
  selectIsLive,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { createTrackTree } from "types/Track/TrackThunks";
import {
  ClipId,
  initializePatternClip,
  initializePoseClip,
  isPatternClipId,
  isPoseClipId,
} from "types/Clip/ClipTypes";
import { createPose } from "types/Pose/PoseThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import { addClipIdsToSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { dispatchCustomEvent } from "utils/html";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectPatternTrackIds,
  selectTrackChainIds,
} from "types/Track/TrackSelectors";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useCallback, useEffect, useRef, useState } from "react";
import { some } from "lodash";
import { createMedia } from "types/Media/MediaThunks";
import { selectPatternClipIds } from "types/Clip/ClipSelectors";
import { selectOverlappingPortaledClipIds } from "types/Arrangement/ArrangementSelectors";
import { useToggledState } from "hooks/useToggledState";

const qwertyKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const miscKeys = ["v", "z", "m", "s", "minus"];

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const selectedTrack = use(selectSelectedTrack);
  const patternTrackId = useDeep(selectPatternTrackIds)[0];
  const patternClipId = useDeep(selectPatternClipIds)[0];
  const poseClipId = use((_) =>
    selectOverlappingPortaledClipIds(_, `${patternClipId}-chunk-1`)
  )[0];

  const scoreRef = useRef<string>(`score_${patternClipId}-chunk-1`);
  const dropdownRef = useRef<string>(`dropdown_${poseClipId}`);
  const score = useToggledState(scoreRef.current, false);
  const dropdown = useToggledState(dropdownRef.current, false);

  const isLive = use(selectIsLive) && score.isOpen && dropdown.isOpen;

  const clipIds = [patternClipId, poseClipId].filter(Boolean);
  const trackChain = useDeep((_) => selectTrackChainIds(_, selectedTrack?.id));
  const depth = trackChain.length - 1;
  const heldKeys = useHeldHotkeys([
    ...qwertyKeys,
    ...numericalKeys,
    ...miscKeys,
  ]);

  const Span = useCallback(
    (props: { keycode: string; label: string }) => (
      <span
        className={
          !!heldKeys[props.keycode]
            ? "text-white text-shadow-lg"
            : "text-slate-400"
        }
      >
        {props.label}
      </span>
    ),
    [heldKeys]
  );

  const Scale = useCallback(
    (props: {
      keycode: string;
      label: string;
      activeClass?: string;
      defaultClass?: string;
    }) => (
      <span
        className={
          !!heldKeys[props.keycode]
            ? `${props.activeClass ?? "text-sky-300"} text-shadow-lg`
            : props.defaultClass ?? "text-sky-400"
        }
      >
        {props.label}
      </span>
    ),
    [heldKeys]
  );

  const Grouping = useCallback(
    (props: {
      keycodes: string[];
      required?: string[];
      label: string;
      activeClass?: string;
      defaultClass?: string;
    }) => {
      const { keycodes, required } = props;
      const isHeld = (key: string) => !!heldKeys[key];
      const active =
        some(keycodes, isHeld) && (required ? some(required, isHeld) : true);
      return (
        <span
          className={
            active
              ? `${props.activeClass ?? "text-white"} text-shadow-lg`
              : props.defaultClass ?? "text-slate-400"
          }
        >
          {props.label}
        </span>
      );
    },
    [heldKeys]
  );

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <div className="py-2 text-white animate-in fade-in duration-300">
        <p className="font-extrabold">Live Play Shortcuts</p>
        <p className="pb-2 mb-2 font-thin text-xs">As Easy As 1-2-3</p>
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
            1. Hold a Scale
          </div>
          <div className="p-1">
            <p className={depth < 0 ? "opacity-50" : ""}>
              <Span keycode="q" label="Hold Q:" />{" "}
              <Scale keycode="q" label="First Track Scale" />
            </p>
            <p className={depth < 1 ? "opacity-50" : ""}>
              <Span keycode="w" label="Hold W:" />{" "}
              <Scale keycode="w" label="Second Track Scale" />
            </p>
            <p className={depth < 2 ? "opacity-50" : ""}>
              <Span keycode="e" label="Hold E:" />{" "}
              <Scale keycode="e" label="Third Track Scale" />
            </p>
            <p>
              <Span keycode="r" label="Hold R:" />{" "}
              <Scale keycode="r" label="Intrinsic Scale" />
            </p>
            <p>
              <Span keycode="t" label="Hold T:" />{" "}
              <Scale keycode="t" label="Chromatic Scale" />
            </p>
            <p>
              <Span keycode="y" label="Hold Y:" />{" "}
              <Scale keycode="y" label="Octave Scale" />
            </p>
          </div>
          <div className="px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded">
            2. Press a Pose
          </div>
          <div className="p-1">
            <p>
              <Span keycode="v" label="Hold V:" />{" "}
              <Scale
                keycode="v"
                label="Show Voice Leadings"
                defaultClass="text-fuchsia-300"
                activeClass="text-fuchsia-200"
              />
            </p>
            <p>
              <Span keycode="-" label="Hold Minus:" />{" "}
              <Scale
                keycode="-"
                label="Apply Negative Offset"
                defaultClass="text-fuchsia-300"
                activeClass="text-fuchsia-200"
              />
            </p>

            <p>
              <Grouping
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["q", "w", "e", "r", "t", "y"]}
                label="Press 1-9:"
              />{" "}
              <Grouping
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["q", "w", "e", "r", "t", "y"]}
                label="Apply Offset of 1-9"
                activeClass="text-fuchsia-200"
                defaultClass="text-fuchsia-300"
              />
            </p>
            <p>
              <Grouping
                keycodes={["0"]}
                required={["q", "w", "e", "r", "t", "y"]}
                label="Press 0:"
              />{" "}
              <Grouping
                keycodes={["0"]}
                required={["q", "w", "e", "r", "t", "y"]}
                label="Reset Offset"
                defaultClass="text-fuchsia-300"
                activeClass="text-fuchsia-200"
              />
            </p>
            <p>
              <Span keycode="z" label="Press Z:" />{" "}
              <Scale
                keycode="z"
                label="Remove Offset"
                defaultClass="text-fuchsia-300"
                activeClass="text-fuchsia-200"
              />
            </p>
          </div>
          <div className="px-2 py-1  bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
            3. Mix Your Tracks
          </div>
          <div className="p-1">
            <p>
              <Span keycode="m" label="Hold M:" />{" "}
              <Scale
                keycode="m"
                label="Prepare to Mute"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p>
              <Span keycode="s" label="Hold S:" />{" "}
              <Scale
                keycode="s"
                label="Prepare to Solo"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p>
              <Grouping
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["s", "m"]}
                label="Press 1-9:"
              />{" "}
              <Grouping
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["s", "m"]}
                label="Target Pattern Track"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p>
              <Grouping
                keycodes={["0"]}
                required={["s", "m"]}
                label="Press 0:"
              />{" "}
              <Grouping
                keycodes={["0"]}
                required={["s", "m"]}
                label="Unmute/Unsolo All Tracks"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
          </div>
        </div>
      </div>
    );
  };

  // The transpose label showing the current types of poses available.
  const LivePlayButton = () => (
    <NavbarTooltipButton
      keepTooltipOnClick
      borderColor="border-fuchsia-500"
      backgroundColor="bg-slate-950"
      className={`cursor-pointer p-1.5 duration-150`}
      notClickable={isLive}
      onClick={() => {
        if (isLive) return;
        const undoType = "prepareLive";
        const trackId =
          patternTrackId ?? dispatch(createTrackTree({ undoType }));

        dispatch(setSelectedTrackId({ data: trackId, undoType }));

        // Create a courtesy pattern and pattern clip for the track
        const ids: ClipId[] = clipIds;
        const data = { trackId };

        // Create a courtesy pose and pose clip for the track
        if (ids.length < 2) {
          if (!ids.some(isPoseClipId)) {
            const poseId = dispatch(createPose({ data, undoType }));
            const clips = [initializePoseClip({ poseId, trackId })];
            const result = dispatch(createMedia({ data: { clips }, undoType }));
            const newPoseId = result.data.clipIds?.[0];
            if (newPoseId) ids.push(newPoseId);
          }
          if (!ids.some(isPatternClipId)) {
            const patternId = dispatch(createPattern({ data, undoType }));
            const clips = [initializePatternClip({ patternId, trackId })];
            const result = dispatch(createMedia({ data: { clips }, undoType }));
            const newPatternId = result.data.clipIds?.[0];
            if (newPatternId) ids.push(newPatternId);
          }
        }

        const pcId = ids.find(isPatternClipId);
        const psId = ids.find(isPoseClipId);
        if (pcId && psId) {
          dispatch(addClipIdsToSelection({ data: [pcId, psId], undoType }));
          const openScore = `score_${pcId}-chunk-1`;
          const openDropdown = `dropdown_${psId}`;
          scoreRef.current = openScore;
          dropdownRef.current = openDropdown;
          setTimeout(() => dispatchCustomEvent(`open_${openScore}`), 50);
          setTimeout(() => dispatchCustomEvent(`open_${openDropdown}`), 100);
        }
      }}
      label={isLive ? NumericalShortcuts() : "Quickstart Live Play"}
    >
      <GiHand className="select-none pointer-events-none" />
    </NavbarTooltipButton>
  );

  if (!isAtLeastRank("maestro")) return null;
  return (
    <div
      className={classNames(
        "relative min-w-8 w-max h-9 select-none",
        "flex items-center rounded-full transition-all font-nunito font-light",
        isLive ? "bg-fuchsia-500/40" : "bg-transparent"
      )}
    >
      {LivePlayButton()}
    </div>
  );
};
