import classNames from "classnames";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { GiHand } from "react-icons/gi";
import { useAuth } from "providers/auth";
import {
  selectIsLive,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { createTrackTree } from "types/Track/TrackThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectOrderedPatternTracks,
  selectTrackAncestorIds,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useCallback, useState } from "react";
import { some } from "lodash";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { useLivePlay } from "features/Timeline/hooks/useLivePlay";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { createPattern } from "types/Pattern/PatternThunks";
import { createPose } from "types/Pose/PoseThunks";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"];
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const trackKeys = ["x", "m", "s"];
const miscKeys = ["u", "i", "o", "p", "v", "z", "minus", "equal"];
const hotkeys = [...qwertyKeys, ...numericalKeys, ...trackKeys, ...miscKeys];

export const NavbarLivePlayButton = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();

  // Keep track of held keys and shortcuts
  const holding = useHeldHotkeys(hotkeys);
  const holdingScale = qwertyKeys.some((key) => !!holding[key]);
  useLivePlay();

  // Get the selected track and its scale names
  const patternTrackIds = useDeep(selectOrderedPatternTracks);
  const selectedTrack = useDeep(selectSelectedTrack);
  const chainIds = useDeep((_) => selectTrackAncestorIds(_, selectedTrack?.id));

  const label1 = use((_) => selectTrackLabelById(_, chainIds[0]));
  const scale1 = use((_) => selectTrackScaleNameAtTick(_, chainIds[0]));
  const scaleName1 = label1 ? `(${label1}) ${scale1}` : `No Track`;

  const label2 = use((_) => selectTrackLabelById(_, chainIds[1]));
  const scale2 = use((_) => selectTrackScaleNameAtTick(_, chainIds[1]));
  const scaleName2 = label2 ? `(${label2}) ${scale2}` : `No Track`;

  const label3 = use((_) => selectTrackLabelById(_, chainIds[2]));
  const scale3 = use((_) => selectTrackScaleNameAtTick(_, chainIds[2]));
  const scaleName3 = label3 ? `(${label3}) ${scale3}` : `No Track`;

  const depth = chainIds.length - 1;

  const ptLabel = use((_) => selectTrackLabelById(_, selectedTrack?.id));

  // The interface is fully live when the score and dropdown are open
  const isLive = use(selectIsLive);

  // The button is in charge of synchronizing the score and dropdown
  const onClick = useCallback(() => {
    let trackId = selectedTrack?.id;
    const undoType = "goLive";
    if (!selectedTrack) {
      if (!patternTrackIds.length) {
        trackId = dispatch(createTrackTree({ undoType }))?.id;
        dispatch(createPattern({ data: { trackId }, undoType }));
        dispatch(createPose({ data: { trackId }, undoType }));
      } else {
        trackId = patternTrackIds[0].id;
      }
    }
    dispatch(setSelectedTrackId({ data: trackId, undoType }));
  }, [selectedTrack, patternTrackIds]);

  const [active, setActive] = useState(false);
  useCustomEventListener("live-shortcuts", (e) => setActive(e.detail));
  if (!isAtLeastRank("maestro")) return null;
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      marginLeft={isLive ? -20 : undefined}
      width={isLive ? 290 : undefined}
      borderColor="border-fuchsia-500"
      className={classNames(
        "bg-gradient-radial to-fuchsia-500/70",
        "relative border border-white/20 size-9 select-none cursor-pointer",
        "flex total-center rounded-full transition-all duration-300 font-nunito font-light",
        isLive ? "from-fuchsia-500/50 opacity-100" : "from-fuchsia-500/5"
      )}
      active={active}
      onClick={onClick}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      label={
        !isLive || !active ? (
          <>
            Equip Keyboard{" "}
            <span className="font-light text-slate-400">(Live Play)</span>
          </>
        ) : (
          <div className="pt-1 text-white animate-in fade-in duration-300">
            <p>
              <span className="font-light text-fuchsia-300">
                Plugged Keyboard into Track {ptLabel}
              </span>
            </p>
            <p className="pb-1 mb-1 font-thin text-xs">
              Unlocked Shortcuts for Live Play!
            </p>
            <div className="flex flex-col gap-2 mt-1.5">
              <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
                1. Pick a Scale
              </div>
              <div className="p-1">
                <p className={depth < 0 ? "opacity-50" : ""}>
                  <Instruction active={holding["q"]} label="Hold Q:" />{" "}
                  <Description
                    active={holding["q"]}
                    label={scaleName1 ?? "First Track Scale"}
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
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
                <p>
                  <Instruction active={holding["r"]} label="Hold R:" />{" "}
                  <Description
                    active={holding["r"]}
                    label="Intrinsic Scale"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["t"]} label="Hold T:" />{" "}
                  <Description
                    active={holding["t"]}
                    label="Chromatic Scale"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["y"]} label="Hold Y:" />{" "}
                  <Description
                    active={holding["y"]}
                    label="Octave Scale"
                    defaultClass="text-sky-400"
                    activeClass="text-sky-300"
                  />
                </p>
              </div>
              <div className="px-2 py-1  bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
                2. Mix Your Tracks
              </div>
              <div className="p-1">
                <p>
                  <Instruction active={holding["x"]} label="Press X:" />{" "}
                  <Description
                    active={holding["x"]}
                    label={`Restart Loop`}
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["m"]} label="Hold M:" />{" "}
                  <Description
                    active={holding["m"]}
                    label="Prepare to Mute"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p>
                  <Instruction active={holding["s"]} label="Hold S:" />{" "}
                  <Description
                    active={holding["s"]}
                    label="Prepare to Solo"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p className={holding["m"] || holding["s"] ? "" : "opacity-50"}>
                  <Description
                    active={(key) =>
                      holding[key] && (holding["m"] || holding["s"])
                    }
                    keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                    required={["s", "m"]}
                    label="Press 1-9:"
                    activeClass="text-white"
                    defaultClass="text-slate-400"
                  />{" "}
                  <Description
                    active={(key) =>
                      holding[key] && (holding["m"] || holding["s"])
                    }
                    keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                    required={["s", "m"]}
                    label="Target Pattern Track #1-9"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
                <p className={holding["m"] || holding["s"] ? "" : "opacity-50"}>
                  <Description
                    active={(key) =>
                      holding[key] && (holding["m"] || holding["s"])
                    }
                    keycodes={["0"]}
                    required={["s", "m"]}
                    label="Press 0:"
                    activeClass="text-white"
                    defaultClass="text-slate-400"
                  />{" "}
                  <Description
                    active={(key) =>
                      holding[key] && (holding["m"] || holding["s"])
                    }
                    keycodes={["0"]}
                    required={["s", "m"]}
                    label="Unmute/Unsolo All Tracks"
                    activeClass="text-emerald-200"
                    defaultClass="text-emerald-300"
                  />
                </p>
              </div>
              <div className={`${holdingScale ? "opacity-100" : "opacity-50"}`}>
                <div
                  className={`px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded`}
                >
                  3. Strike a Pose
                </div>
                <div className="p-1">
                  <p>
                    <Description
                      active={(key) => holding[key]}
                      keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                      required={["q", "w", "e", "r", "t", "y"]}
                      label="Press 1-9:"
                      activeClass="text-white"
                      defaultClass="text-slate-400"
                    />{" "}
                    <Description
                      active={(key) => holding[key]}
                      keycodes={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                      required={["q", "w", "e", "r", "t", "y"]}
                      label={`Move ${
                        holding["-"] || holding["`"]
                          ? holding["="]
                            ? "to Step -1 to -9"
                            : "Down 1 to 9 Steps"
                          : holding["="]
                          ? "to Step 1 to 9"
                          : "Up 1 to 9 Steps"
                      }`}
                      activeClass="text-fuchsia-200"
                      defaultClass="text-fuchsia-300"
                    />
                  </p>
                  <p>
                    <Instruction
                      active={holding["-"] || holding["`"]}
                      label="Hold Minus:"
                    />{" "}
                    <Description
                      active={holding["-"]}
                      label="Move Down"
                      defaultClass="text-fuchsia-300"
                      activeClass="text-fuchsia-200"
                    />
                  </p>
                  <p>
                    <Instruction active={holding["="]} label="Hold Equal:" />{" "}
                    <Description
                      active={holding["="]}
                      label="Move Exactly"
                      defaultClass="text-fuchsia-300"
                      activeClass="text-fuchsia-200"
                    />
                  </p>
                  <p>
                    <Description
                      active={(key) => holding[key]}
                      keycodes={["0"]}
                      required={["q", "w", "e", "r", "t", "y"]}
                      label="Press 0:"
                      activeClass="text-white"
                      defaultClass="text-slate-400"
                    />{" "}
                    <Description
                      active={(key) => holding[key]}
                      keycodes={["0"]}
                      required={["q", "w", "e", "r", "t", "y"]}
                      label="Move to Root Step"
                      defaultClass="text-fuchsia-300"
                      activeClass="text-fuchsia-200"
                    />
                  </p>

                  <p>
                    <Instruction active={holding["z"]} label="Press Z:" />{" "}
                    <Description
                      active={holding["z"]}
                      label={`Remove ${
                        holdingScale ? "Selected" : "All"
                      } Values`}
                      defaultClass="text-fuchsia-300"
                      activeClass="text-fuchsia-200"
                    />
                  </p>
                  <p>
                    <Instruction active={holding["v"]} label="Hold V:" />{" "}
                    <Description
                      active={holding["v"]}
                      label="Create a Voice Leading"
                      defaultClass="text-fuchsia-300"
                      activeClass="text-fuchsia-200"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }
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
