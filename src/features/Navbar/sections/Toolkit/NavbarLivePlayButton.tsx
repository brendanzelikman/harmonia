import classNames from "classnames";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { GiMultiDirections } from "react-icons/gi";
import { useAuth } from "providers/auth";
import {
  selectIsLive,
  selectSelectedPoseClips,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import {
  selectOrderedPatternTracks,
  selectTrackAncestorIds,
  selectTrackInstrumentMap,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useState } from "react";
import { some } from "lodash";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { useLivePlay } from "features/Timeline/hooks/useLivePlay";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import pluralize from "pluralize";
import { selectInstrumentMap } from "types/Instrument/InstrumentSelectors";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const trackKeys = ["x", "m", "s"];
const miscKeys = ["u", "i", "o", "p", "v", "z", "minus", "`", "equal"];
const hotkeys = [...qwertyKeys, ...numericalKeys, ...trackKeys, ...miscKeys];

export const NavbarLivePlayIcon = GiMultiDirections;
export const navbarLiveBackground =
  "bg-gradient-radial from-fuchsia-700/80 to-fuchsia-500/80";

export const NavbarLivePlayButton = () => {
  useLivePlay();
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const isSelectingPoseClip = !!useDeep(selectSelectedPoseClips).length;

  // Keep track of held keys and shortcuts
  const holding = useHeldHotkeys(hotkeys);
  const holdingScale = qwertyKeys.some((key) => !!holding[key]);
  const isNegative = holding["-"] || holding["`"];
  const isExact = holding["="];
  const isMuting = holding["m"];
  const isSoloing = holding["s"];
  const mixingTrack = isMuting || isSoloing;
  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  // Get the selected track and its scale names
  const patternTracks = useDeep(selectOrderedPatternTracks);
  const instrumentMap = useDeep(selectTrackInstrumentMap);
  const selectedTrack = useDeep(selectSelectedTrack);
  const chainIds = useDeep((_) => selectTrackAncestorIds(_, selectedTrack?.id));

  const label1 = use((_) => selectTrackLabelById(_, chainIds[0]));
  const scale1 = use((_) => selectTrackScaleNameAtTick(_, chainIds[0]));
  const scaleName1 = label1 ? `${scale1} (Labeled ${label1})` : `No Track`;

  const label2 = use((_) => selectTrackLabelById(_, chainIds[1]));
  const scale2 = use((_) => selectTrackScaleNameAtTick(_, chainIds[1]));
  const scaleName2 = label2 ? `${scale2} (Labeled ${label2})` : `No Track`;

  const label3 = use((_) => selectTrackLabelById(_, chainIds[2]));
  const scale3 = use((_) => selectTrackScaleNameAtTick(_, chainIds[2]));
  const scaleName3 = label3 ? `${scale3} (Labeled ${label3})` : `No Track`;

  const depth = chainIds.length - 1;

  const ptLabel = use((_) => selectTrackLabelById(_, selectedTrack?.id));

  const labelMap = {
    q: label1 ?? "A",
    w: label2,
    e: label3,
    r: "t",
    t: "T",
    y: "O",
  } as const;

  const getKeycodeLabel = (keycode: string) => {
    const number = parseInt(keycode);
    let vector: string[] = [];
    if (mixingTrack) {
      const track = patternTracks.at(number - 1);
      if (!track) return "No Track";
      const instrument = instrumentMap[track.id];
      if (!instrument) return "No Track Instrument";
      const { mute, solo } = instrument;
      let action = "";
      if (isMuting) {
        action += mute ? "Unmute" : "Mute";
      }
      if (isMuting && isSoloing) action += "/";
      if (isSoloing) {
        action += solo ? "Unsolo" : "Solo";
      }
      return `${action} Pattern Track #${keycode}`;
    }
    qwertyKeys.forEach((key) => {
      const isHolding = holding[key];
      const label = labelMap[key];
      if (isHolding && label) {
        vector.push(`${label}${sign}${keycode}`);
      }
    });
    if (vector.length) {
      const vectorString = vector.join(", ");
      const phrase = isExact ? "Move to" : "Move by ";
      return `${phrase} <${vectorString}>`;
    }
    if (isExact) {
      return `Move to Step ${keycode} In Scale`;
    }
    const steps = pluralize("Step", number);
    const tag = `Move ${keycode} ${steps} ${direction} Scale`;
    return tag;
  };

  const getZeroLabel = () => {
    if (mixingTrack) {
      const action =
        isMuting && isSoloing
          ? "Unmute/Unsolo"
          : isMuting
          ? "Unmute"
          : "Unsolo";
      return `${action} All Tracks`;
    }
    if (holdingScale) {
      return "Remove Selected Scales";
    }
    return "Remove All Values";
  };

  // The interface is fully live when the score and dropdown are open
  const isLive = use(selectIsLive);

  // The button is in charge of synchronizing the score and dropdown

  const [active, setActive] = useState(false);
  useCustomEventListener("live-shortcuts", (e) => setActive(e.detail));
  if (!isAtLeastRank("maestro")) return null;
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      marginLeft={isLive ? -20 : undefined}
      width={isLive ? 370 : undefined}
      borderColor="border-fuchsia-500"
      className={classNames(
        "relative border border-white/20 size-9 select-none cursor-pointer",
        "flex total-center rounded-full transition-all duration-300 font-nunito font-light",
        isLive
          ? navbarLiveBackground
          : "bg-gradient-radial from-fuchsia-500/30 to-fuchsia-500/50"
      )}
      active={active}
      onClick={() => dispatch(toggleLivePlay())}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      label={
        !isLive || !active ? (
          <>
            Quickstart Live Play{" "}
            <span className="font-light text-slate-400">(P)</span>
          </>
        ) : (
          <div className="pt-1 text-white animate-in fade-in duration-300">
            <div className="text-xl font-light">
              {" "}
              {mixingTrack
                ? "Mixing Pattern Tracks (MS + #)"
                : isSelectingPoseClip
                ? "Update Selected Poses (QWERTY + #)"
                : "Create New Poses (QWERTY + #)"}
            </div>
            <div className="text-base mb-3 text-fuchsia-300/80">
              Enabled Live Play for Track {ptLabel}
            </div>
            {/* <p className="pb-1 mb-1 font-thin text-xs">
              Unlocked Shortcuts for Live Posing!
            </p> */}
            <div className="flex flex-col gap-2 mt-1.5">
              <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
                Select Track Scales
              </div>
              <div className="p-1">
                {depth >= 0 && (
                  <p className={depth < 0 ? "opacity-50" : ""}>
                    <Instruction active={holding["q"]} label="Hold Q:" />{" "}
                    <Description
                      active={holding["q"]}
                      label={`${scaleName1 ?? "First Track Scale"}`}
                      defaultClass="text-sky-400"
                      activeClass="text-sky-300"
                    />
                  </p>
                )}
                <p className={depth < 1 ? "opacity-50" : ""}>
                  <Instruction active={holding["w"]} label="Hold W:" />{" "}
                  <Description
                    active={holding["w"]}
                    label={scaleName2 ?? "Second Track Scale"}
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p className={depth < 2 ? "opacity-50" : ""}>
                  <Instruction active={holding["e"]} label="Hold E:" />{" "}
                  <Description
                    active={holding["e"]}
                    label={scaleName3 ?? "Third Track Scale"}
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p className="normal-case">
                  <Instruction active={holding["r"]} label="Hold R:" />{" "}
                  <Description
                    active={holding["r"]}
                    label="Intrinsic Scale (Labeled t)"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["t"]} label="Hold T:" />{" "}
                  <Description
                    active={holding["t"]}
                    label="Chromatic Scale (Labeled T)"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["y"]} label="Hold Y:" />{" "}
                  <Description
                    active={holding["y"]}
                    label="Octave Scale (labeled O)"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
              </div>
              <div className="px-2 py-1  bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
                Apply Modifiers
              </div>
              <div className="p-1">
                <p>
                  <Description
                    active={(key) => holding[key]}
                    keycodes={["-", "`"]}
                    label={"Hold Minus:"}
                    activeClass="text-white"
                    defaultClass="text-slate-400"
                  />{" "}
                  <Description
                    active={(key) => holding[key]}
                    keycodes={["-", "`"]}
                    label="Input Negative Offset"
                    defaultClass="text-emerald-300"
                    activeClass="text-emerald-200"
                  />
                </p>
                <p>
                  <Instruction active={holding["="]} label="Hold Equal:" />{" "}
                  <Description
                    active={holding["="]}
                    label="Input Exact Offset"
                    defaultClass="text-emerald-300"
                    activeClass="text-emerald-200"
                  />
                </p>
                <p>
                  <Instruction active={holding["m"]} label="Hold M:" />{" "}
                  <Description
                    active={holding["m"]}
                    label="Mute Pattern Tracks"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["s"]} label="Hold S:" />{" "}
                  <Description
                    active={holding["s"]}
                    label="Solo Pattern Tracks"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["x"]} label="Press X:" />{" "}
                  <Description
                    active={holding["x"]}
                    label={`Move to Loop Start`}
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
              </div>
              <div>
                <div
                  className={`px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded`}
                >
                  {mixingTrack
                    ? "Mixing Pattern Tracks"
                    : isSelectingPoseClip
                    ? "Update Selected Poses"
                    : "Create New Poses"}
                </div>
                <div className="p-1">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                    (keycode) => (
                      <p
                        className={`${
                          !holdingScale && !mixingTrack
                            ? "opacity-50"
                            : "opacity-100"
                        } normal-case`}
                      >
                        <Description
                          active={(key) => holding[key]}
                          keycodes={[keycode]}
                          required={["q", "w", "e", "r", "t", "y"]}
                          label={`Press ${keycode}:`}
                          activeClass="text-white"
                          defaultClass="text-slate-400"
                        />{" "}
                        <Description
                          active={(key) => holding[key]}
                          keycodes={[keycode]}
                          required={["q", "w", "e", "r", "t", "y"]}
                          // label={`Move ${
                          //   holding["-"] || holding["`"]
                          //     ? "Down 1 to 9 Steps"
                          //     : "Up 1 to 9 Steps"
                          // }`}
                          label={getKeycodeLabel(keycode)}
                          activeClass="text-fuchsia-200"
                          defaultClass="text-fuchsia-300"
                        />
                      </p>
                    )
                  )}
                  {isSelectingPoseClip && (
                    <p>
                      <Description
                        active={(key) => holding[key]}
                        keycodes={["0"]}
                        label="Press 0:"
                        activeClass="text-white"
                        defaultClass="text-slate-400"
                      />{" "}
                      <Description
                        active={(key) => holding[key]}
                        keycodes={["0"]}
                        label={getZeroLabel()}
                        defaultClass="text-fuchsia-300"
                        activeClass="text-fuchsia-200"
                      />
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    >
      <GiMultiDirections className="select-none pointer-events-none" />
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
