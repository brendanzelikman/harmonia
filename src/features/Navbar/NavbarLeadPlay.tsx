import classNames from "classnames";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { GiMisdirection, GiPathDistance } from "react-icons/gi";
import {
  selectIsSelectingPatternClips,
  selectIsSelectingPoseClips,
  selectSomeTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectTrackAncestorIds,
  selectTrackInstrumentMap,
  selectTrackLabelById,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { useCallback, useMemo } from "react";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { TooltipButton } from "components/TooltipButton";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { getKeyCode } from "hooks/useHeldkeys";
import { growTree } from "types/Timeline/TimelineThunks";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { selectHasGame } from "types/Game/GameSelectors";
import {
  NavbarHotkeyInstruction,
  NavbarHotkeyKey,
  NavbarInstructionDescription,
  NavbarPatternDescription,
  NavbarPoseDescription,
  NavbarScaleDescription,
} from "./components/NavbarHotkeys";
import { useGestures } from "lib/gestures";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const numericalKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export const NavbarLeadPlay = () => {
  const dispatch = useAppDispatch();
  const holding = useGestures();

  // Get selected values
  const hasTracks = useAppValue(selectHasTracks);
  const hasGame = useAppValue(selectHasGame);
  const patternTracks = useAppValue(selectPatternTracks);
  const selectedTrackId = useAppValue(selectSomeTrackId);
  const chain = useAppValue((_) => selectTrackAncestorIds(_, selectedTrackId));
  const instruments = useAppValue(selectTrackInstrumentMap);
  const labels = useAppValue(selectTrackLabelMap);

  const isSelectingPatternClip = useAppValue(selectIsSelectingPatternClips);
  const isSelectingPoseClip = useAppValue(selectIsSelectingPoseClips);

  // Get the values of the held keys
  const isNegative = holding[getKeyCode("-")] || holding[getKeyCode("`")];
  const isExact = holding[getKeyCode("=")];
  const isMuting = holding[getKeyCode("m")];
  const isSoloing = holding[getKeyCode("s")];
  const isMixing = isMuting || isSoloing;
  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  const scaleKey = qwertyKeys.find((key) => holding[getKeyCode(key)]);
  const isHoldingScale = !!scaleKey;
  const isPosing = isHoldingScale;
  const holdingC = holding[getKeyCode("c")];
  const holdingD = holding[getKeyCode("d")];
  const isVoiceLeadingClosest = holdingC && isSelectingPatternClip;
  const isVoiceLeadingDegree = holdingD && isSelectingPatternClip;

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

  const working = !hasGame && (holdingC || holdingD);

  const isActive = (working || hasTracks) && isSelectingPatternClip;

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
        const label = labels[track?.id];
        const name = getInstrumentName(instrument.key);
        return `${action} Sampler ${label} (${name})`;
      }

      if (isVoiceLeadingDegree) {
        const sign = isNegative ? "-" : "";
        return `Closest Pose With ${
          labelMap[scaleKey ?? "q"]
        }${sign}${keycode}`;
      }

      if (isVoiceLeadingClosest) {
        return `${cardinalMap[keycode]} Closest Pose (By Distance)`;
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
      return "No Effect Available";
      // return `Shortcut #${keycode}`;
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
      labels,
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
      return "Clear Scalar Offsets";
    }
    if (isSelectingPoseClip) {
      return "Remove All Values";
    } else {
      return "Go to Root";
    }
  }, [isPosing, isMixing, isSelectingPoseClip, isMuting, isSoloing]);

  const SelectScales = (
    <>
      <div className="px-2 py-1 bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
        Select Scales (Default = Q+W+E)
      </div>
      <div data-mixing={isMixing} className="p-1 data-[mixing=true]:opacity-50">
        <p>
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("q")] && scaleName1 !== "No Scale"}
            label="Hold Q:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("q")] && scaleName1 !== "No Scale"}
            label={`Search By ${scaleName1}`}
          />
        </p>

        <p>
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("w")]}
            label="Hold W:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("w")] && scaleName2 !== "No Scale"}
            label={`Search By ${scaleName2}`}
          />
        </p>
        <p>
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("e")] && scaleName3 !== "No Scale"}
            label="Hold E:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("e")] && scaleName3 !== "No Scale"}
            label={`Search By ${scaleName3}`}
          />
        </p>
        <p className="normal-case">
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("r")]}
            label="Hold R:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("r")]}
            label={`Search By Rotation (r)`}
          />
        </p>
        <p className="normal-case">
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("t")]}
            label="Hold T:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("t")]}
            label={`Search By Semitone (t)`}
          />
        </p>
        <p className="normal-case">
          <NavbarHotkeyInstruction
            active={holding[getKeyCode("y")]}
            label="Hold Y:"
          />{" "}
          <NavbarPatternDescription
            active={holding[getKeyCode("y")]}
            label={`Search By Octave (y)`}
          />
        </p>
      </div>
    </>
  );

  const ApplyModifiers = (
    <>
      {" "}
      <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
        Select Mode
      </div>
      <div className="p-1">
        <p>
          <p>
            <NavbarHotkeyInstruction
              active={holding[getKeyCode("c")]}
              label="Hold C:"
            />{" "}
            <NavbarScaleDescription
              active={holding[getKeyCode("c")]}
              label="Voice Lead by Closeness"
            />
          </p>
          <p>
            <NavbarHotkeyInstruction
              active={holding[getKeyCode("d")]}
              label="Hold D:"
            />{" "}
            <NavbarScaleDescription
              active={holding[getKeyCode("d")]}
              label="Voice Lead by Degree"
            />
          </p>
          <p>
            <NavbarInstructionDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["-", "`"]}
              label={"Hold Minus:"}
            />{" "}
            <NavbarScaleDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["-", "`"]}
              label="Use Descending Motion"
            />
          </p>
          <p>
            <NavbarInstructionDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["="]}
              label={"Hold Equal:"}
            />{" "}
            <NavbarScaleDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["="]}
              label="Use Ascending Motion"
            />
          </p>
        </p>
      </div>
    </>
  );

  const Action = useMemo(
    () => (
      <div>
        <div
          className={`px-2 py-1 bg-gradient-to-r from-teal-500/40 to-teal-500/20 rounded`}
        >
          {isMixing
            ? "Mix Samplers"
            : isVoiceLeadingClosest || isVoiceLeadingDegree
            ? `Voice Lead Patterns`
            : isSelectingPoseClip
            ? "Update Poses"
            : "Create Poses"}
        </div>
        <div className="p-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((keycode) => (
            <p
              key={keycode}
              className={`${
                !selectedTrackId ? "opacity-50" : "opacity-100"
              } normal-case`}
            >
              <NavbarInstructionDescription
                active={(key) => holding[getKeyCode(key)]}
                keycodes={[keycode]}
                required={["q", "w", "e", "r", "t", "y"]}
                label={`Press ${keycode}:`}
              />{" "}
              <NavbarPoseDescription
                active={(key) => holding[getKeyCode(key)]}
                keycodes={[keycode]}
                required={["q", "w", "e", "r", "t", "y"]}
                label={getKeycodeLabel(keycode)}
              />
            </p>
          ))}
          <p>
            <NavbarInstructionDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["0"]}
              label="Press 0:"
            />{" "}
            <NavbarPoseDescription
              active={(key) => holding[getKeyCode(key)]}
              keycodes={["0"]}
              label={getZeroLabel()}
            />
          </p>
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

  const Q = NavbarHotkeyKey("Q", holding[getKeyCode("q")]);
  const W = NavbarHotkeyKey("W", holding[getKeyCode("w")]);
  const E = NavbarHotkeyKey("E", holding[getKeyCode("e")]);
  const R = NavbarHotkeyKey("R", holding[getKeyCode("r")]);
  const T = NavbarHotkeyKey("T", holding[getKeyCode("t")]);
  const Y = NavbarHotkeyKey("Y", holding[getKeyCode("y")]);
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

  const C = NavbarHotkeyKey("C", holding[getKeyCode("c")]);
  const D = NavbarHotkeyKey("D", holding[getKeyCode("d")]);

  return (
    <TooltipButton
      direction="vertical"
      active={hasTracks && working}
      freezeInside={working}
      hideRing
      activeLabel={
        isVoiceLeadingClosest ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">
              Voice Leading By Closeness
            </div>
            <div className="text-slate-400 text-sm">
              (Hold {C} + {QWERTY} + Press Number)
            </div>
          </div>
        ) : isVoiceLeadingDegree ? (
          <div className="h-[68px] total-center-col">
            <div className="text-base font-light">Voice Leading By Degree </div>
            <div className="text-slate-400 text-sm">
              (Hold {D} + {QWERTY} + Press Number)
            </div>
          </div>
        ) : null
      }
      keepTooltipOnClick
      notClickable
      marginLeft={-50}
      onClick={() => !hasTracks && dispatch(growTree())}
      marginTop={0}
      width={350}
      backgroundColor="bg-radial from-slate-900 to-zinc-900"
      borderColor={`border-2 border-teal-500`}
      rounding="rounded-lg"
      className={classNames(
        "shrink-0 relative rounded-full select-none cursor-pointer",
        "flex total-center hover:text-teal-300 p-1 bg-teal-700/80 border border-teal-500 font-light",
        working ? "text-teal-200" : "text-teal-100"
      )}
      label={
        <div
          data-indent={hasTracks || working}
          className="text-white data-[indent=true]:mb-2 animate-in fade-in duration-300"
        >
          <div
            data-indent={hasTracks || working}
            className="text-xl data-[indent=true]:pt-2 font-light"
          >
            {" "}
            {isVoiceLeadingClosest
              ? "Voice Lead By Closeness"
              : isVoiceLeadingDegree
              ? "Voice Lead by Degree"
              : !isSelectingPatternClip
              ? "Find Voice Leadings"
              : "Find Voice Leadings"}
          </div>
          <div
            data-active={isActive}
            className="text-base data-[active=false]:text-sm data-[active=true]:mb-4 text-teal-300/80"
          >
            {!isActive ? (
              hasTracks ? (
                "Select a Pattern to Voice Lead"
              ) : (
                "Create Tree to Unlock Keyboard Gestures"
              )
            ) : isVoiceLeadingClosest ? (
              <div>(Hold C + Press Number)</div>
            ) : isVoiceLeadingDegree ? (
              <div>(Hold D + Press Number)</div>
            ) : (
              "(Hold C/D + Press Number)"
            )}
          </div>
          {isActive && (
            <div className="flex flex-col w-full gap-2 mt-1.5">
              {ApplyModifiers}
              {SelectScales}
              {Action}
            </div>
          )}
        </div>
      }
    >
      {isVoiceLeadingClosest || isVoiceLeadingDegree ? (
        <GiMisdirection className="text-2xl" />
      ) : (
        <GiPathDistance className="text-2xl" />
      )}
    </TooltipButton>
  );
};

const cardinalMap: Record<string, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
};
