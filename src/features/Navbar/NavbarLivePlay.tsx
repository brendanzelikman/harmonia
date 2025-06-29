import { useAppValue } from "hooks/useRedux";
import { GiDominoMask, GiMisdirection, GiToolbox } from "react-icons/gi";
import { selectIsSelectingPoseClips } from "types/Timeline/TimelineSelectors";
import { useCallback } from "react";
import { selectTrackLiveLabelMap } from "types/Arrangement/ArrangementTrackSelectors";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
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
  const holding = useHeldKeys(heldKeys);
  const isSelectingPoseClip = useAppValue(selectIsSelectingPoseClips);
  const labelMap = useAppValue(selectTrackLiveLabelMap);
  const scaleKey = qwertyKeys.find((key) => holding[getKeyCode(key)]);
  const isHoldingScale = !!scaleKey;

  // Get the values of the held keys
  const q = holding[getKeyCode("q")];
  const w = holding[getKeyCode("w")];
  const e = holding[getKeyCode("e")];
  const r = holding[getKeyCode("r")];
  const t = holding[getKeyCode("t")];
  const y = holding[getKeyCode("y")];
  const minus = holding[getKeyCode("-")];
  const tilde = holding[getKeyCode("`")];
  const equal = holding[getKeyCode("=")];

  // Unpack the values
  const isNegative = minus || tilde;
  const isExact = equal;
  const sign = isNegative ? "-" : "";
  const direction = isNegative ? "Down" : "Up";

  // Stylize the components
  const Q = NavbarHotkeyKey("Hold Q: ", q);
  const W = NavbarHotkeyKey("Hold W: ", w);
  const E = NavbarHotkeyKey("Hold E: ", e);
  const R = NavbarHotkeyKey("Hold R: ", r);
  const T = NavbarHotkeyKey("Hold T: ", t);
  const Y = NavbarHotkeyKey("Hold Y: ", y);
  const Minus = NavbarHotkeyKey("Hold Minus/Tilde", isNegative);
  const Equal = NavbarHotkeyKey("Hold Equal", isExact);

  // Get the label for each keycode
  const getKeycodeLabel = useCallback(
    (keycode: string) => {
      if (!isHoldingScale) return "No Effect Available";
      const number = parseInt(keycode);
      const steps = "Step" + (number === 1 ? "" : "s");

      const vector: string[] = [];

      qwertyKeys.forEach((key) => {
        if (key === "q" && labelMap.q.label === "*") return;
        if (key === "w" && labelMap.w.label === "*") return;
        if (key === "e" && labelMap.e.label === "*") return;
        const label = labelMap[key].label;
        if (holding[getKeyCode(key)] && label) {
          vector.push(`${label}${sign}${keycode}`);
        }
      });

      if (vector.length) {
        return `${isExact ? "Move to" : "Move by "} ${vector.join(" + ")}`;
      }
      if (isExact) {
        return `Move to Step ${keycode} In Scale`;
      }
      return `Move ${keycode} ${steps} ${direction} Scale`;
    },
    [holding, labelMap, isNegative]
  );

  const zeroLabel = isHoldingScale
    ? "Clear Scalar Offsets"
    : isSelectingPoseClip
    ? "Remove All Values"
    : "Go To Root";

  return (
    <NavbarActionButton
      title="Gesture - Transposition"
      subtitle="Create Poses to Move Along Scales"
      subtitleClass="text-sky-400"
      Icon={<LivePlayIcon className="text-2xl" />}
      background="bg-radial from-sky-900/70 to-sky-500/70"
      borderColor="border-sky-500"
      minWidth="min-w-72"
    >
      <NavbarActionButtonOption
        title="Select Scales"
        Icon={<GiDominoMask />}
        subtitle={
          <ul>
            <li>
              {Q}
              <span className="text-sky-400">
                Transpose by {labelMap.q.name}
              </span>
            </li>
            <li>
              {W}
              <span className="text-sky-400">
                Transpose by {labelMap.w.name}
              </span>
            </li>
            <li>
              {E}
              <span className="text-sky-400">
                Transpose by {labelMap.e.name}
              </span>
            </li>
            <li>
              {R}
              <span className="text-sky-400">
                Transpose by {labelMap.r.name}
              </span>
            </li>
            <li>
              {T}
              <span className="text-sky-400">
                Transpose by {labelMap.t.name}
              </span>
            </li>
            <li>
              {Y}
              <span className="text-sky-400">
                Transpose by {labelMap.y.name}
              </span>
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
