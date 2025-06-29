import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { GiDominoMask, GiMisdirection, GiToolbox } from "react-icons/gi";
import {
  selectIsSelectingPoseClips,
  selectSomeTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackAncestorIds,
  selectTrackLabelById,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { useCallback, useMemo } from "react";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
import { growTree } from "types/Timeline/TimelineThunks";
import {
  NavbarHotkeyInstruction,
  NavbarHotkeyKey,
} from "./components/NavbarHotkeys";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";

export const LivePlayIcon = GiMisdirection;

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const heldKeys = [...qwertyKeys, "c", "d", "-", "`", "="];

export const NavbarLivePlay = () => {
  const dispatch = useAppDispatch();
  const holding = useHeldKeys(heldKeys);

  // Get selected values
  const selectedTrackId = useAppValue(selectSomeTrackId);
  const chain = useAppValue((_) => selectTrackAncestorIds(_, selectedTrackId));
  const labels = useAppValue(selectTrackLabelMap);
  const isSelectingPoseClip = useAppValue(selectIsSelectingPoseClips);

  // Get the values of the held keys
  const isNegative = holding[getKeyCode("-")] || holding[getKeyCode("`")];
  const isExact = holding[getKeyCode("=")];
  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  // Check if a key is being pressed
  const scaleKey = qwertyKeys.find((key) => holding[getKeyCode(key)]);
  const isHoldingScale = !!scaleKey;

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
  const labelMap = useMemo(() => {
    return {
      q: label1 ?? "A",
      w: label2,
      e: label3,
      r: "r",
      t: "t",
      y: "y",
    } as const;
  }, [label1, label2, label3]);

  const getKeycodeLabel = useCallback(
    (keycode: string) => {
      const number = parseInt(keycode);
      const steps = "Step" + (number === 1 ? "" : "s");

      let vector: string[] = [];

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
    },
    [holding, labelMap, isNegative, labels]
  );

  const zeroLabel = isHoldingScale
    ? "Clear Scalar Offsets"
    : isSelectingPoseClip
    ? "Remove All Values"
    : "Go To Root";

  const Q = NavbarHotkeyKey("Hold Q: ", holding[getKeyCode("q")]);
  const W = NavbarHotkeyKey("Hold W: ", holding[getKeyCode("w")]);
  const E = NavbarHotkeyKey("Hold E: ", holding[getKeyCode("e")]);
  const R = NavbarHotkeyKey("Hold R: ", holding[getKeyCode("r")]);
  const T = NavbarHotkeyKey("Hold T: ", holding[getKeyCode("t")]);
  const Y = NavbarHotkeyKey("Hold Y: ", holding[getKeyCode("y")]);
  const Minus = NavbarHotkeyKey(
    "Hold Minus/Tilde",
    holding[getKeyCode("-")] || holding[getKeyCode("`")]
  );
  const Equal = NavbarHotkeyKey("Hold Equal", holding[getKeyCode("=")]);

  return (
    <NavbarActionButton
      title="Gesture - Transposition"
      subtitle="Create Poses to Move Along Scales"
      subtitleClass="text-sky-400"
      Icon={<LivePlayIcon className="text-2xl" />}
      background="bg-radial from-sky-900/70 to-sky-500/70"
      borderColor="border-sky-500"
      minWidth="min-w-72"
      onClick={() => dispatch(growTree())}
    >
      <NavbarActionButtonOption
        title="Select Scales"
        Icon={<GiDominoMask />}
        subtitle={
          <ul>
            <li>
              {Q}
              <span className="text-sky-400">Transpose by {scaleName1}</span>
            </li>
            <li>
              {W}
              <span className="text-sky-400">Transpose by {scaleName2}</span>
            </li>
            <li>
              {E}
              <span className="text-sky-400">Transpose by {scaleName3}</span>
            </li>
            <li>
              {R}
              <span className="text-sky-400">Transpose by Rotation (r)</span>
            </li>
            <li>
              {T}
              <span className="text-sky-400">Transpose by Semitone (t)</span>
            </li>
            <li>
              {Y}
              <span className="text-sky-400">Transpose by Octave (y)</span>
            </li>
          </ul>
        }
        stripe="border-b-sky-500"
        readOnly
      />
      <NavbarActionButtonOption
        title="Apply Modifiers"
        Icon={<GiToolbox />}
        subtitle={
          <ul>
            <li>
              {Minus}:{" "}
              <span className="text-emerald-400">Input Negative Offset</span>
            </li>
            <li>
              {Equal}:{" "}
              <span className="text-emerald-400">Input Exact Offset</span>
            </li>
          </ul>
        }
        stripe="border-b-emerald-500"
        readOnly
      />
      <NavbarActionButtonOption
        title="Create Poses"
        Icon={<LivePlayIcon />}
        subtitle={
          <ul>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
              <li key={key}>
                <NavbarHotkeyInstruction label={`Press ${key}:`} />{" "}
                <span className="text-fuchsia-300">
                  {getKeycodeLabel(key.toString())}
                </span>
              </li>
            ))}
            <li>
              <NavbarHotkeyInstruction label="Press 0:" />{" "}
              <span className="text-fuchsia-300">{zeroLabel}</span>
            </li>
          </ul>
        }
        stripe="border-b-fuchsia-500"
        readOnly
      />
    </NavbarActionButton>
  );
};
