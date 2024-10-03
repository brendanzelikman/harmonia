import classNames from "classnames";
import { use, useDeep, useProjectDispatch } from "types/hooks";
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
  PortaledPatternClipId,
  PortaledPoseClipId,
} from "types/Clip/ClipTypes";
import { createPose } from "types/Pose/PoseThunks";
import { createPattern } from "types/Pattern/PatternThunks";
import { addClipIdsToSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { dispatchCustomEvent } from "utils/html";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectOrderedPatternTracks,
  selectScaleTracks,
  selectTrackChainIds,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { useHeldHotkeys, useHotkeysInTimeline } from "lib/react-hotkeys-hook";
import { useCallback, useRef } from "react";
import { some } from "lodash";
import { createMedia } from "types/Media/MediaThunks";
import {
  selectFirstPortaledPatternClipId,
  selectFirstPortaledPoseClipId,
} from "types/Arrangement/ArrangementSelectors";
import { useToggledState } from "hooks/useToggledState";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { useLivePlay } from "features/Timeline/hooks/useLivePlay";
import { NavbarTooltipButton } from "components/TooltipButton";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { sanitize } from "utils/math";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"];
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const trackKeys = ["x", "m", "s"];
const miscKeys = ["u", "i", "o", "p", "v", "z", "minus", "equal"];
const hotkeys = [...qwertyKeys, ...numericalKeys, ...trackKeys, ...miscKeys];

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const scaleTracks = useDeep(selectScaleTracks);
  const scaleTrackId = (
    scaleTracks.findLast((track) => !!track.parentId) ?? scaleTracks.at(-1)
  )?.id;

  // Keep track of held keys and shortcuts
  const heldKeys = useHeldHotkeys(hotkeys);
  const holdingScale = qwertyKeys.some((key) => !!heldKeys[key]);
  const heldNumber = numericalKeys.find((key) => !!heldKeys[key]);
  const patternTrackId = useDeep(selectOrderedPatternTracks)[
    heldNumber === undefined ? 0 : sanitize(parseInt(heldNumber) - 1)
  ]?.id;
  const ptLabel = use((_) => selectTrackLabelById(_, patternTrackId));
  useLivePlay();

  // Get the selected track and its scale names
  const selectedTrack = useDeep(selectSelectedTrack);
  const chainIds = useDeep((_) => selectTrackChainIds(_, selectedTrack?.id));
  const scaleName1 = use((_) => selectTrackScaleNameAtTick(_, chainIds[0]));
  const scaleName2 = use((_) => selectTrackScaleNameAtTick(_, chainIds[1]));
  const scaleName3 = use((_) => selectTrackScaleNameAtTick(_, chainIds[2]));
  const depth = chainIds.length - 1;

  // The first pattern clip and its score
  const patternClipId = use(selectFirstPortaledPatternClipId);
  const scoreRef = useRef<string>(`score_${patternClipId}`);

  // The first pose clip and its dropdown
  const poseClipId = use(selectFirstPortaledPoseClipId);
  const dropdownRef = useRef<string>(`dropdown_${poseClipId}`);

  // The interface is fully live when the score and dropdown are open
  const isTimelineLive = use(selectIsLive);
  const isLive = isTimelineLive;

  // The button is in charge of synchronizing the score and dropdown
  const onClick = useCallback(() => {
    const undoType = "prepareLive";
    const trackId =
      patternTrackId ??
      (scaleTrackId
        ? dispatch(createPatternTrack({ parentId: scaleTrackId }))
        : dispatch(createTrackTree({ undoType })));

    dispatch(setSelectedTrackId({ data: trackId, undoType }));

    // Create a courtesy pattern and pattern clip for the track
    const ids = [patternClipId, poseClipId].filter(Boolean) as ClipId[];
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
        if (newPatternId) ids.push(`${newPatternId}-chunk-1`);
      }
    }

    const pcId = ids.find(isPatternClipId) as PortaledPatternClipId | undefined;
    const psId = ids.find(isPoseClipId) as PortaledPoseClipId | undefined;

    if (pcId && psId) {
      const ogPcId = getOriginalIdFromPortaledClip(pcId);
      const ogPsId = getOriginalIdFromPortaledClip(psId);
      dispatch(addClipIdsToSelection({ data: [ogPcId, ogPsId], undoType }));
      const tag = isLive ? "close" : "open";
      const score = `score_${pcId}`;
      const dropdown = `dropdown_${psId}`;
      scoreRef.current = score;
      dropdownRef.current = dropdown;
      setTimeout(() => dispatchCustomEvent(`${tag}_${score}`), 5);
      setTimeout(() => dispatchCustomEvent(`${tag}_${dropdown}`), 10);
    }
  }, [isLive, scaleTrackId, patternTrackId, patternClipId, poseClipId]);

  useHotkeysInTimeline({
    name: "Start Live Play",
    description: "Open the Live Play interface",
    shortcut: "l",
    callback: onClick,
  });

  // Get the numerical shortcuts.
  const NumericalShortcuts = () => {
    return (
      <div className="py-2 text-white animate-in fade-in duration-300">
        <p>
          <span className="font-extrabold">Live Play: </span>
          <span className="font-light text-fuchsia-300">
            Enabled for Pattern Track {ptLabel}
          </span>
        </p>
        <p className="pb-2 mb-2 font-thin text-xs">
          Keyboard-Based Shortcuts for Improvisation
        </p>
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
            1. Pick a Scale
          </div>
          <div className="p-1">
            <p className={depth < 0 ? "opacity-50" : ""}>
              <Instruction active={heldKeys["q"]} label="Hold Q:" />{" "}
              <Description
                active={heldKeys["q"]}
                label={scaleName1 ?? "First Track Scale"}
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
            <p className={depth < 1 ? "opacity-50" : ""}>
              <Instruction active={heldKeys["w"]} label="Hold W:" />{" "}
              <Description
                active={heldKeys["w"]}
                label={scaleName2 ?? "Second Track Scale"}
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
            <p className={depth < 2 ? "opacity-50" : ""}>
              <Instruction active={heldKeys["e"]} label="Hold E:" />{" "}
              <Description
                active={heldKeys["e"]}
                label={scaleName3 ?? "Third Track Scale"}
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
            <p>
              <Instruction active={heldKeys["r"]} label="Hold R:" />{" "}
              <Description
                active={heldKeys["r"]}
                label="Intrinsic Scale"
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
            <p>
              <Instruction active={heldKeys["t"]} label="Hold T:" />{" "}
              <Description
                active={heldKeys["t"]}
                label="Chromatic Scale"
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
            <p>
              <Instruction active={heldKeys["y"]} label="Hold Y:" />{" "}
              <Description
                active={heldKeys["y"]}
                label="Octave Scale"
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
          </div>
          <div className={`${holdingScale ? "opacity-100" : "opacity-50"}`}>
            <div
              className={`px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded`}
            >
              2. Strike a Pose
            </div>
            <div className="p-1">
              <p>
                <Description
                  active={(key) => heldKeys[key]}
                  keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                  required={["q", "w", "e", "r", "t", "y"]}
                  label="Press Number:"
                  activeClass="text-white"
                  defaultClass="text-slate-400"
                />{" "}
                <Description
                  active={(key) => heldKeys[key]}
                  keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                  required={["q", "w", "e", "r", "t", "y"]}
                  label="Move Up 1-9 Steps"
                  activeClass="text-fuchsia-200"
                  defaultClass="text-fuchsia-300"
                />
              </p>
              <p>
                <Instruction active={heldKeys["-"]} label="Hold Minus:" />{" "}
                <Description
                  active={heldKeys["-"]}
                  label="Move Down 1-9 Steps"
                  defaultClass="text-fuchsia-300"
                  activeClass="text-fuchsia-200"
                />
              </p>
              <p>
                <Instruction active={heldKeys["="]} label="Hold Equal:" />{" "}
                <Description
                  active={heldKeys["="]}
                  label="Move to Exact Step"
                  defaultClass="text-fuchsia-300"
                  activeClass="text-fuchsia-200"
                />
              </p>
              <p>
                <Description
                  active={(key) => heldKeys[key]}
                  keycodes={["0"]}
                  required={["q", "w", "e", "r", "t", "y"]}
                  label="Press 0:"
                  activeClass="text-white"
                  defaultClass="text-slate-400"
                />{" "}
                <Description
                  active={(key) => heldKeys[key]}
                  keycodes={["0"]}
                  required={["q", "w", "e", "r", "t", "y"]}
                  label="Move to Root"
                  defaultClass="text-fuchsia-300"
                  activeClass="text-fuchsia-200"
                />
              </p>

              <p>
                <Instruction active={heldKeys["z"]} label="Press Z:" />{" "}
                <Description
                  active={heldKeys["z"]}
                  label={`Remove ${holdingScale ? "Selected" : "All"} Values`}
                  defaultClass="text-fuchsia-300"
                  activeClass="text-fuchsia-200"
                />
              </p>
              <p>
                <Instruction active={heldKeys["v"]} label="Hold V:" />{" "}
                <Description
                  active={heldKeys["v"]}
                  label="Create a Voice Leading"
                  defaultClass="text-fuchsia-300"
                  activeClass="text-fuchsia-200"
                />
              </p>
            </div>
          </div>
          <div className="px-2 py-1  bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
            3. Mix Your Tracks
          </div>
          <div className="p-1">
            <p>
              <Instruction active={heldKeys["x"]} label="Press X:" />{" "}
              <Description
                active={heldKeys["x"]}
                label={`Restart Loop`}
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p>
              <Instruction active={heldKeys["m"]} label="Hold M:" />{" "}
              <Description
                active={heldKeys["m"]}
                label="Prepare to Mute"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p>
              <Instruction active={heldKeys["s"]} label="Hold S:" />{" "}
              <Description
                active={heldKeys["s"]}
                label="Prepare to Solo"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p className={heldKeys["m"] || heldKeys["s"] ? "" : "opacity-50"}>
              <Description
                active={(key) =>
                  heldKeys[key] && (heldKeys["m"] || heldKeys["s"])
                }
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["s", "m"]}
                label="Press 1-9:"
                activeClass="text-white"
                defaultClass="text-slate-400"
              />{" "}
              <Description
                active={(key) =>
                  heldKeys[key] && (heldKeys["m"] || heldKeys["s"])
                }
                keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                required={["s", "m"]}
                label="Target Pattern Track #1-9"
                activeClass="text-emerald-200"
                defaultClass="text-emerald-300"
              />
            </p>
            <p className={heldKeys["m"] || heldKeys["s"] ? "" : "opacity-50"}>
              <Description
                active={(key) =>
                  heldKeys[key] && (heldKeys["m"] || heldKeys["s"])
                }
                keycodes={["0"]}
                required={["s", "m"]}
                label="Press 0:"
                activeClass="text-white"
                defaultClass="text-slate-400"
              />{" "}
              <Description
                active={(key) =>
                  heldKeys[key] && (heldKeys["m"] || heldKeys["s"])
                }
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

  if (!isAtLeastRank("maestro")) return null;
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      marginLeft={isLive ? -190 : undefined}
      width={isLive ? 290 : undefined}
      borderColor="border-fuchsia-500"
      className={classNames(
        "relative select-none cursor-pointer",
        "flex total-center rounded-full transition-all duration-300 font-nunito font-light",
        isLive ? "bg-fuchsia-500/70" : "bg-transparent"
      )}
      onClick={onClick}
      label={isLive ? NumericalShortcuts() : "Start Live Play"}
    >
      <GiHand className="select-none pointer-events-none" />
    </NavbarTooltipButton>
  );
};

const Instruction = (props: { active: boolean; label: string }) => (
  <span
    className={props.active ? "text-white text-shadow-lg" : "text-slate-400"}
  >
    {props.label}
  </span>
);

const Description = (
  props: {
    label: string;
    activeClass: string;
    defaultClass: string;
  } & (
    | { active: boolean }
    | {
        active: (key: string) => boolean;
        keycodes: readonly string[];
        required?: readonly string[];
      }
  )
) => {
  const { label, active, activeClass, defaultClass } = props;
  const isActive =
    typeof active === "boolean"
      ? active
      : some(props.keycodes, active) &&
        (props.required ? some(props.required, active) : true);
  return (
    <span className={isActive ? `${activeClass} text-shadow-lg` : defaultClass}>
      {label}
    </span>
  );
};
