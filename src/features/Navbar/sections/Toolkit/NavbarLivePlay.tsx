import classNames from "classnames";
import { useDeep } from "types/hooks";
import {
  GiArchiveResearch,
  GiConsoleController,
  GiCrystalWand,
  GiJackPlug,
  GiMisdirection,
  GiRetroController,
} from "react-icons/gi";
import {
  selectIsSelectingPatternClips,
  selectIsSelectingPoseClips,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectTrackAncestorIds,
  selectTrackInstrumentMap,
  selectTrackLabelById,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { memo, useCallback, useMemo } from "react";
import { some } from "lodash";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { useLivePlay } from "features/Timeline/hooks/useLivePlay";
import { TooltipButton } from "components/TooltipButton";
import pluralize from "pluralize";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { TRACK_WIDTH } from "utils/constants";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const trackKeys = ["x", "m", "s"];
const miscKeys = ["c", "d", "v", "minus", "`", "equal"];
const hotkeys = [...qwertyKeys, ...numericalKeys, ...trackKeys, ...miscKeys];

export const NavbarLivePlay = () => {
  useLivePlay();
  const isSelectingPatternClip = useDeep(selectIsSelectingPatternClips);
  const isSelectingPoseClip = useDeep(selectIsSelectingPoseClips);

  // Keep track of held keys and shortcuts
  const holding = useHeldHotkeys(hotkeys);
  const holdingNumerical = some(numericalKeys, (key) => holding[key]);

  const isNegative = holding["-"] || holding["`"];
  const isExact = holding["="];

  const isMuting = holding.m;
  const isSoloing = holding.s;

  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  // Get the selected track and its scale names
  const patternTracks = useDeep(selectPatternTracks);
  const instrumentMap = useDeep(selectTrackInstrumentMap);
  const selectedTrack = useDeep(selectSelectedTrack);
  const chainIds = useDeep((_) => selectTrackAncestorIds(_, selectedTrack?.id));

  const label1 = useDeep((_) => selectTrackLabelById(_, chainIds[0]));
  const scale1 = useDeep((_) => selectTrackScaleNameAtTick(_, chainIds[0]));
  const scaleName1 = label1 !== "*" ? `${scale1} (${label1})` : `First Scale`;
  const hasScale1 = scaleName1 !== `First Scale`;

  const label2 = useDeep((_) => selectTrackLabelById(_, chainIds[1]));
  const scale2 = useDeep((_) => selectTrackScaleNameAtTick(_, chainIds[1]));
  const scaleName2 = label2 !== "*" ? `${scale2} (${label2})` : `Second Scale`;
  const hasScale2 = scaleName2 !== `Second Scale`;

  const label3 = useDeep((_) => selectTrackLabelById(_, chainIds[2]));
  const scale3 = useDeep((_) => selectTrackScaleNameAtTick(_, chainIds[2]));
  const scaleName3 = label3 !== "*" ? `${scale3} (${label3})` : `Third Scale`;
  const hasScale3 = scaleName3 !== `Third Scale`;

  const isMixing = isMuting || isSoloing;

  const holdingPoses =
    holding.q || holding.w || holding.e || holding.r || holding.t || holding.y;

  const isPosing = selectedTrack && holdingPoses;

  const isVoiceLeadingDegree =
    holding.d && isSelectingPatternClip && holdingPoses;
  const isVoiceLeadingClosest =
    holding.c && isSelectingPatternClip && holdingPoses;

  const depth = chainIds.length - 1;

  const labelMap = {
    q: label1 ?? "A",
    w: label2,
    e: label3,
    r: "r",
    t: "t",
    y: "y",
  } as const;

  const trackMap = useDeep(selectTrackLabelMap);
  const getKeycodeLabel = useCallback(
    (keycode: string) => {
      const number = parseInt(keycode);
      const steps = pluralize("Step", number);

      let vector: string[] = [];

      if (isMixing) {
        const track = patternTracks.at(number - 1);
        if (!track) return "No Sampler Available";
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
        return `${action} Sampler ${trackMap[patternTracks[number - 1]?.id]}`;
      }

      if (isVoiceLeadingDegree) {
        return `Voice Leading at Degree ${isNegative ? "-" : ""}${keycode}`;
      }

      if (isVoiceLeadingClosest) {
        return `Closest Voice Leading #${keycode}`;
      }

      qwertyKeys.forEach((key) => {
        if (key === "q" && !hasScale1) return;
        if (key === "w" && !hasScale2) return;
        if (key === "e" && !hasScale3) return;
        const isHolding = holding[key];
        const label = labelMap[key];
        if (isHolding && label) {
          vector.push(`${label}${sign}${keycode}`);
        }
      });
      if (vector.length && holdingPoses) {
        const vectorString = vector.join(" + ");
        const phrase = isExact ? "Move to" : "Move by ";
        return `${phrase} ${vectorString}`;
      }
      if (holdingPoses) {
        if (isExact) {
          return `Move to Step ${keycode} In Scale`;
        }
        return `Move ${keycode} ${steps} ${direction} Scale`;
      }
      return `Shortcut #${keycode}`;
    },
    [
      holding,
      labelMap,
      isNegative,
      isMixing,
      isVoiceLeadingClosest,
      isVoiceLeadingDegree,
      isPosing,
      patternTracks,
      isMuting,
      isSoloing,
    ]
  );

  const getZeroLabel = useCallback(() => {
    if (isMixing) {
      const action =
        isMuting && isSoloing
          ? "Unmute/Unsolo"
          : isMuting
          ? "Unmute"
          : "Unsolo";
      return `${action} All Tracks`;
    }
    if (isPosing) {
      return "Remove Selected Scales";
    }
    return "Remove All Values";
  }, [isPosing, isMixing, isMuting, isSoloing]);

  const SelectScales = useMemo(
    () => (
      <>
        <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
          Select Scales
        </div>
        <div
          data-mixing={isMixing}
          className="p-1 data-[mixing=true]:opacity-50"
        >
          {
            <p>
              <Instruction
                active={holding["q"] && scaleName1 !== "No Scale"}
                label="Hold Q:"
              />{" "}
              <Description
                active={holding["q"] && scaleName1 !== "No Scale"}
                label={`Apply ${scaleName1}`}
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
          }
          <p>
            <Instruction active={holding["w"]} label="Hold W:" />{" "}
            <Description
              active={holding["w"] && scaleName2 !== "No Scale"}
              label={`Apply ${scaleName2}`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p>
            <Instruction
              active={holding["e"] && scaleName3 !== "No Scale"}
              label="Hold E:"
            />{" "}
            <Description
              active={holding["e"] && scaleName3 !== "No Scale"}
              label={`Apply ${scaleName3}`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding["r"]} label="Hold R:" />{" "}
            <Description
              active={holding["r"]}
              label={`Apply Rotations (r)`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding["t"]} label="Hold T:" />{" "}
            <Description
              active={holding["t"]}
              label={`Apply Semitones (t)`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding["y"]} label="Hold Y:" />{" "}
            <Description
              active={holding["y"]}
              label={`Apply Octaves (y)`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
        </div>
      </>
    ),
    [depth, holding, scaleName1, scaleName2, scaleName3, isMixing]
  );

  const ApplyModifiers = useMemo(
    () => (
      <>
        {" "}
        <div className="px-2 py-1 bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
          Apply Modifiers
        </div>
        <div className="p-1">
          <p
            data-dim={isMixing || !holdingPoses}
            className="data-[dim=true]:opacity-50"
          >
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
          <p
            data-dim={isMixing || !holdingPoses}
            className="data-[dim=true]:opacity-50"
          >
            <Instruction active={holding["="]} label="Hold Equal:" />{" "}
            <Description
              active={holding["="]}
              label="Input Exact Offset"
              defaultClass="text-emerald-300"
              activeClass="text-emerald-200"
            />
          </p>
          {isSelectingPatternClip && (
            <>
              <p
                data-active={holdingPoses}
                className="data-[active=true]:opacity-100 opacity-50"
              >
                <Instruction active={holding["c"]} label="Hold C:" />{" "}
                <Description
                  active={holding["c"]}
                  label="Voice Lead by Closeness"
                  activeClass="text-emerald-200"
                  defaultClass="text-emerald-300"
                />
              </p>
              <p
                data-active={holdingPoses}
                className="data-[active=true]:opacity-100 opacity-50"
              >
                <Instruction active={holding["d"]} label="Hold D:" />{" "}
                <Description
                  active={holding["d"]}
                  label="Voice Lead by Degree"
                  activeClass="text-emerald-200"
                  defaultClass="text-emerald-300"
                />
              </p>
            </>
          )}
          <p>
            <Instruction active={holding["m"]} label="Hold M:" />{" "}
            <Description
              active={holding["m"]}
              label="Mute Samplers"
              activeClass="text-emerald-200"
              defaultClass="text-emerald-300"
            />
          </p>
          <p>
            <Instruction active={holding["s"]} label="Hold S:" />{" "}
            <Description
              active={holding["s"]}
              label="Solo Samplers"
              activeClass="text-emerald-200"
              defaultClass="text-emerald-300"
            />
          </p>
        </div>
      </>
    ),
    [holding, isSelectingPatternClip]
  );

  const Action = useMemo(
    () => (
      <div>
        <div
          className={`px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded`}
        >
          {isMixing
            ? "Mix Samplers"
            : isVoiceLeadingClosest || isVoiceLeadingDegree
            ? `Voice Lead Patterns`
            : isSelectingPoseClip
            ? "Update Poses"
            : holdingPoses
            ? "Create Poses"
            : "Explore Tree"}
        </div>
        <div className="p-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((keycode) => (
            <p
              key={keycode}
              className={`${
                !holdingPoses &&
                !isMixing &&
                !isVoiceLeadingDegree &&
                !isVoiceLeadingClosest
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
                label={getKeycodeLabel(keycode)}
                activeClass="text-fuchsia-200"
                defaultClass="text-fuchsia-300"
              />
            </p>
          ))}
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
    ),
    [
      holding,
      getKeycodeLabel,
      getZeroLabel,
      holdingPoses,
      isSelectingPoseClip,
      isMixing,
    ]
  );

  const hasTracks = useDeep(selectHasTracks);
  const working =
    isMixing || isVoiceLeadingClosest || isVoiceLeadingDegree || holdingPoses;
  const isActive = working || hasTracks;

  const Span = useCallback((label: string, active = false, slow = false) => {
    return (
      <span
        data-active={active}
        data-slow={slow}
        className="data-[active=true]:text-slate-200 transition-all data-[slow=true]:data-[active=false]:duration-1000 data-[slow=true]:data-[active=true]:duration-75"
      >
        {label}
      </span>
    );
  }, []);

  const Q = Span("Q", holding.q);
  const W = Span("W", holding.w);
  const E = Span("E", holding.e);
  const R = Span("R", holding.r);
  const T = Span("T", holding.t);
  const Y = Span("Y", holding.y);
  const QWERTY = (
    <>
      {Q}
      {W}
      {E}
      {R}
      {T}
      {Y}
    </>
  );
  const Number = Span("Press Number", holdingNumerical, true);
  const C = Span("C", holding.c);
  const D = Span("D", holding.d);
  const M = Span("M", holding.m);
  const S = Span("S", holding.s);
  return (
    <TooltipButton
      direction="vertical"
      active={working}
      freezeInside={working}
      hideRing
      activeLabel={
        isMixing ? (
          <div className="h-[4.5rem] total-center-col">
            <div className="text-base font-light">Mixing Samplers by Index</div>
            <div className="text-slate-400 text-sm">
              (Hold {M}/{S} + {Number})
            </div>
          </div>
        ) : isVoiceLeadingClosest ? (
          <div className="h-[4.5rem] total-center-col">
            <div className="text-base font-light">
              Posing Pattern by Closeness
            </div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {C} + {Number})
            </div>
          </div>
        ) : isVoiceLeadingDegree ? (
          <div className="h-[4.5rem] total-center-col">
            <div className="text-base font-light">Posing Pattern by Degree</div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {D} + {Number})
            </div>
          </div>
        ) : isSelectingPoseClip ? (
          <div className="h-[4.5rem] total-center-col">
            <div className="text-base font-light">Update Poses</div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {Number})
            </div>
          </div>
        ) : holdingPoses ? (
          <div className="h-[4.5rem] total-center-col">
            <div className="text-base font-light">Creating Poses by Offset</div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {Number})
            </div>
          </div>
        ) : null
      }
      keepTooltipOnClick
      notClickable
      marginLeft={-143}
      marginTop={0}
      width={TRACK_WIDTH}
      borderColor="border-fuchsia-500"
      rounding="rounded-sm"
      className={classNames(
        "min-w-8 min-h-8 shrink-0 relative size-9 rounded-full select-none cursor-pointer",
        "flex total-center transition-all font-nunito font-light",
        working ? "text-fuchsia-400" : ""
      )}
      label={
        <div className="text-white animate-in fade-in duration-300">
          <div
            data-indent={hasTracks}
            className="text-xl data-[indent=true]:pt-1 font-light"
          >
            {" "}
            {isMixing
              ? "Mix Samplers"
              : isVoiceLeadingClosest
              ? "Calculate by Closeness"
              : isVoiceLeadingDegree
              ? "Calculate by Degree"
              : isSelectingPoseClip
              ? "Update Poses"
              : holdingPoses
              ? "Create Poses"
              : hasTracks
              ? "Keyboard Shortcuts"
              : ""}
          </div>
          <div
            data-active={isActive}
            className="text-base data-[active=false]:text-sm data-[active=true]:mb-3 text-fuchsia-300/80"
          >
            {!isActive
              ? hasTracks
                ? "Select Track, Pattern, or Pose"
                : "Create Tree to Unlock Keyboard Shortcuts"
              : "Develop Your Project"}
          </div>
          {isActive && (
            <div className="flex flex-col w-full gap-2 mt-1.5">
              {SelectScales}
              {ApplyModifiers}
              {Action}
            </div>
          )}
        </div>
      }
    >
      {isMixing ? (
        <GiJackPlug className="text-2xl" />
      ) : isVoiceLeadingClosest || isVoiceLeadingDegree ? (
        <GiMisdirection className="text-2xl" />
      ) : isPosing ? (
        <GiCrystalWand className="text-2xl" />
      ) : hasTracks ? (
        <GiConsoleController className="text-3xl" />
      ) : (
        <GiArchiveResearch className="text-2xl" />
      )}
    </TooltipButton>
  );
};

const Instruction = memo((props: { active: boolean; label: string }) => (
  <span
    className={props.active ? "text-white text-shadow-lg" : "text-slate-400"}
  >
    {props.label}
  </span>
));

const Description = memo(
  (
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
      <span
        className={isActive ? `${activeClass} text-shadow-lg` : defaultClass}
      >
        {label}
      </span>
    );
  }
);
