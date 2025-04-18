import classNames from "classnames";
import { useAppValue } from "hooks/useRedux";
import {
  GiCrystalWand,
  GiJackPlug,
  GiMisdirection,
  GiMoebiusTriangle,
} from "react-icons/gi";
import {
  selectIsSelectingPatternClips,
  selectIsSelectingPoseClips,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectTrackAncestorIds,
  selectTrackInstrumentMap,
  selectTrackLabelById,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { memo, useCallback, useMemo } from "react";
import { some } from "lodash";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { useGestures } from "lib/gestures";
import { TooltipButton } from "components/TooltipButton";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { TRACK_WIDTH } from "utils/constants";
import { useToggle } from "hooks/useToggle";
import { getKeyCode } from "hooks/useHeldkeys";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export const NavbarLivePlay = () => {
  const holding = useGestures();

  // Get selected values
  const patternTracks = useAppValue(selectPatternTracks);
  const selectedTrackId = useAppValue(selectSelectedTrackId);
  const chain = useAppValue((_) => selectTrackAncestorIds(_, selectedTrackId));
  const depth = chain.length - 1;
  const instruments = useAppValue(selectTrackInstrumentMap);
  const labels = useAppValue(selectTrackLabelMap);

  const isSelectingPatternClip = useAppValue(selectIsSelectingPatternClips);
  const isSelectingPoseClip = useAppValue(selectIsSelectingPoseClips);

  // Get the values of the held keys
  const isNumerical = numericalKeys.some((key) => holding[getKeyCode(key)]);
  const isNegative = holding[getKeyCode("-")] || holding[getKeyCode("`")];
  const isExact = holding[getKeyCode("=")];
  const isMuting = holding[getKeyCode("m")];
  const isSoloing = holding[getKeyCode("s")];
  const isMixing = isMuting || isSoloing;
  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  const isHoldingScale = ["q", "w", "e", "r", "t", "y"].some(
    (key) => holding[getKeyCode(key)]
  );
  const isPosing = selectedTrackId && isHoldingScale;
  const isVoiceLeadingDegree =
    holding[getKeyCode("d")] && isSelectingPatternClip;
  const isVoiceLeadingClosest =
    holding[getKeyCode("c")] && isSelectingPatternClip;

  // Get the first chain id
  const label1 = useAppValue((_) => selectTrackLabelById(_, chain[0]));
  const scale1 = useAppValue((_) => selectTrackScaleNameAtTick(_, chain[0]));
  const scaleName1 = label1 !== "*" ? `${scale1} (${label1})` : `First Scale`;
  const hasScale1 = scaleName1 !== `First Scale`;

  // Get the second chain id
  const label2 = useAppValue((_) => selectTrackLabelById(_, chain[1]));
  const scale2 = useAppValue((_) => selectTrackScaleNameAtTick(_, chain[1]));
  const scaleName2 = label2 !== "*" ? `${scale2} (${label2})` : `Second Scale`;
  const hasScale2 = scaleName2 !== `Second Scale`;

  // Get the third chain id
  const label3 = useAppValue((_) => selectTrackLabelById(_, chain[2]));
  const scale3 = useAppValue((_) => selectTrackScaleNameAtTick(_, chain[2]));
  const scaleName3 = label3 !== "*" ? `${scale3} (${label3})` : `Third Scale`;
  const hasScale3 = scaleName3 !== `Third Scale`;

  // Get the label map
  const labelMap = {
    q: label1 ?? "A",
    w: label2,
    e: label3,
    r: "r",
    t: "t",
    y: "y",
  } as const;

  const getKeycodeLabel = useCallback(
    (keycode: string) => {
      const number = parseInt(keycode);
      const steps = "Step" + (number === 1 ? "" : "s");

      let vector: string[] = [];

      if (isMixing) {
        const track = patternTracks.at(number - 1);
        if (!track) return "No Sampler Available";
        const instrument = instruments[track.id];
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
        return `${action} Sampler ${labels[patternTracks[number - 1]?.id]}`;
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
        const label = labelMap[key];
        if (holding[getKeyCode(key)] && label) {
          vector.push(`${label}${sign}${keycode}`);
        }
      });
      if (vector.length && isHoldingScale) {
        const vectorString = vector.join(" + ");
        const phrase = isExact ? "Move to" : "Move by ";
        return `${phrase} ${vectorString}`;
      }
      if (isHoldingScale) {
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
      instruments,
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
                active={holding[getKeyCode("q")] && scaleName1 !== "No Scale"}
                label="Hold Q:"
              />{" "}
              <Description
                active={holding[getKeyCode("q")] && scaleName1 !== "No Scale"}
                label={`Apply ${scaleName1}`}
                defaultClass="text-sky-400"
                activeClass="text-sky-300"
              />
            </p>
          }
          <p>
            <Instruction active={holding[getKeyCode("w")]} label="Hold W:" />{" "}
            <Description
              active={holding[getKeyCode("w")] && scaleName2 !== "No Scale"}
              label={`Apply ${scaleName2}`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p>
            <Instruction
              active={holding[getKeyCode("e")] && scaleName3 !== "No Scale"}
              label="Hold E:"
            />{" "}
            <Description
              active={holding[getKeyCode("e")] && scaleName3 !== "No Scale"}
              label={`Apply ${scaleName3}`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding[getKeyCode("r")]} label="Hold R:" />{" "}
            <Description
              active={holding[getKeyCode("r")]}
              label={`Apply Rotations (r)`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding[getKeyCode("t")]} label="Hold T:" />{" "}
            <Description
              active={holding[getKeyCode("t")]}
              label={`Apply Semitones (t)`}
              defaultClass="text-sky-400"
              activeClass="text-sky-300"
            />
          </p>
          <p className="normal-case">
            <Instruction active={holding[getKeyCode("y")]} label="Hold Y:" />{" "}
            <Description
              active={holding[getKeyCode("y")]}
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
            data-dim={isMixing || !isHoldingScale}
            className="data-[dim=true]:opacity-50"
          >
            <Description
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["-", "`"]}
              label={"Hold Minus:"}
              activeClass="text-white"
              defaultClass="text-slate-400"
            />{" "}
            <Description
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["-", "`"]}
              label="Input Negative Offset"
              defaultClass="text-emerald-300"
              activeClass="text-emerald-200"
            />
          </p>
          <p
            data-dim={isMixing || !isHoldingScale}
            className="data-[dim=true]:opacity-50"
          >
            <Instruction
              active={holding[getKeyCode("=")]}
              label="Hold Equal:"
            />{" "}
            <Description
              active={holding[getKeyCode("=")]}
              label="Input Exact Offset"
              defaultClass="text-emerald-300"
              activeClass="text-emerald-200"
            />
          </p>
          {isSelectingPatternClip && (
            <>
              <p>
                <Instruction
                  active={holding[getKeyCode("c")]}
                  label="Hold C:"
                />{" "}
                <Description
                  active={holding[getKeyCode("c")]}
                  label="Voice Lead by Closeness"
                  activeClass="text-emerald-200"
                  defaultClass="text-emerald-300"
                />
              </p>
              <p>
                <Instruction
                  active={holding[getKeyCode("d")]}
                  label="Hold D:"
                />{" "}
                <Description
                  active={holding[getKeyCode("d")]}
                  label="Voice Lead by Degree"
                  activeClass="text-emerald-200"
                  defaultClass="text-emerald-300"
                />
              </p>
            </>
          )}
          <p>
            <Instruction active={holding[getKeyCode("m")]} label="Hold M:" />{" "}
            <Description
              active={holding[getKeyCode("m")]}
              label="Mute Samplers"
              activeClass="text-emerald-200"
              defaultClass="text-emerald-300"
            />
          </p>
          <p>
            <Instruction active={holding[getKeyCode("s")]} label="Hold S:" />{" "}
            <Description
              active={holding[getKeyCode("s")]}
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
            : isHoldingScale
            ? "Create Poses"
            : "Explore Tree"}
        </div>
        <div className="p-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((keycode) => (
            <p
              key={keycode}
              className={`${
                !isHoldingScale &&
                !isMixing &&
                !isVoiceLeadingDegree &&
                !isVoiceLeadingClosest
                  ? "opacity-50"
                  : "opacity-100"
              } normal-case`}
            >
              <Description
                active={(key) => holding[getKeyCode(key)]}
                keycodes={[keycode]}
                required={["q", "w", "e", "r", "t", "y"]}
                label={`Press ${keycode}:`}
                activeClass="text-white"
                defaultClass="text-slate-400"
              />{" "}
              <Description
                active={(key) => holding[getKeyCode(key)]}
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
                active={(key) => holding[getKeyCode(key)]}
                keycodes={["0"]}
                label="Press 0:"
                activeClass="text-white"
                defaultClass="text-slate-400"
              />{" "}
              <Description
                active={(key) => holding[getKeyCode(key)]}
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
      isHoldingScale,
      isSelectingPoseClip,
      isMixing,
    ]
  );

  const hasTracks = useAppValue(selectHasTracks);
  const working =
    isMixing || isVoiceLeadingClosest || isVoiceLeadingDegree || isHoldingScale;

  const signal = useToggle("livePlay");
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

  const Q = Span("Q", holding[getKeyCode("q")]);
  const W = Span("W", holding[getKeyCode("w")]);
  const E = Span("E", holding[getKeyCode("e")]);
  const R = Span("R", holding[getKeyCode("r")]);
  const T = Span("T", holding[getKeyCode("t")]);
  const Y = Span("Y", holding[getKeyCode("y")]);
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
  const Number = Span("Press Number", isNumerical, true);
  const C = Span("C", holding[getKeyCode("c")]);
  const D = Span("D", holding[getKeyCode("d")]);
  const M = Span("M", holding[getKeyCode("m")]);
  const S = Span("S", holding[getKeyCode("s")]);
  return (
    <TooltipButton
      direction="vertical"
      active={working || signal.isOpen}
      freezeInside={working}
      hideRing
      activeLabel={
        isMixing ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">Mixing Samplers by Index</div>
            <div className="text-slate-400 text-sm">
              (Hold {M}/{S} + {Number})
            </div>
          </div>
        ) : isVoiceLeadingClosest ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">
              Closest Pose Along Scales
            </div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {C} + {Number})
            </div>
          </div>
        ) : isVoiceLeadingDegree ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">Closest Pose At Degree </div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {D} + {Number})
            </div>
          </div>
        ) : isSelectingPoseClip ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">Updating Poses</div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {Number})
            </div>
          </div>
        ) : isHoldingScale ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">Creating Poses</div>
            <div className="text-slate-400 text-sm">
              (Hold {QWERTY} + {Number})
            </div>
          </div>
        ) : null
      }
      keepTooltipOnClick
      notClickable
      marginLeft={-157}
      marginTop={0}
      width={TRACK_WIDTH}
      backgroundColor="bg-radial from-slate-900 to-zinc-900"
      borderColor={`border-2 border-fuchsia-500`}
      rounding="rounded-sm"
      className={classNames(
        "min-w-8 min-h-7 -ml-1 shrink-0 relative size-9 rounded-full select-none cursor-pointer",
        "flex total-center hover:text-fuchsia-300 transition-all font-light",
        working || signal.isOpen ? "text-fuchsia-400" : ""
      )}
      label={
        <div className="text-white animate-in fade-in duration-300">
          <div
            data-indent={hasTracks}
            className="text-xl data-[indent=true]:pt-2 font-light"
          >
            {" "}
            {isMixing
              ? "Mixing Samplers by Index"
              : isVoiceLeadingClosest
              ? "Closest Pose Along Scales"
              : isVoiceLeadingDegree
              ? "Closest Pose At Degree"
              : isSelectingPoseClip
              ? "Updating Poses"
              : isHoldingScale
              ? "Creating Poses"
              : hasTracks
              ? "Keyboard Gestures"
              : ""}
          </div>
          <div
            data-active={isActive}
            className="text-base data-[active=false]:text-sm data-[active=true]:mb-4 text-fuchsia-300/80"
          >
            {!isActive ? (
              hasTracks ? (
                "Select Track, Pattern, or Pose"
              ) : (
                "Create Tree to Unlock Keyboard Gestures"
              )
            ) : isMixing ? (
              <div>(Hold M/S + Number)</div>
            ) : isVoiceLeadingClosest ? (
              <div>(Hold QWERTY + C + Number)</div>
            ) : isVoiceLeadingDegree ? (
              <div>(Hold QWERTY + D + Number)</div>
            ) : isSelectingPoseClip ? (
              <div>(Hold QWERTY + Number)</div>
            ) : isHoldingScale ? (
              <div>(Hold QWERTY + Number)</div>
            ) : (
              "For Composition and Improvisation"
            )}
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
        <GiMoebiusTriangle className="text-2xl" />
      ) : (
        <GiMoebiusTriangle className="text-2xl" />
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
