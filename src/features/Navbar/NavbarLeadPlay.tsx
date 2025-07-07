import { useAppValue } from "hooks/useRedux";
import {
  GiBugNet,
  GiDominoMask,
  GiMisdirection,
  GiOnTarget,
  GiPathDistance,
  GiToolbox,
} from "react-icons/gi";
import { selectIsSelectingPatternClips } from "types/Timeline/TimelineSelectors";
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
import { ArrangePoseIcon } from "lib/hotkeys/timeline";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const heldKeys = [...qwertyKeys, "c", "d", "-", "`", "="];

export const NavbarLeadPlay = () => {
  const holding = useHeldKeys(heldKeys);
  const labelMap = useAppValue(selectTrackLiveLabelMap);

  // Get the values of the held keys
  const q = holding[getKeyCode("q")];
  const w = holding[getKeyCode("w")];
  const e = holding[getKeyCode("e")];
  const r = holding[getKeyCode("r")];
  const t = holding[getKeyCode("t")];
  const y = holding[getKeyCode("y")];
  const c = holding[getKeyCode("c")];
  const d = holding[getKeyCode("d")];
  const minus = holding[getKeyCode("-")];
  const tilde = holding[getKeyCode("`")];
  const equal = holding[getKeyCode("=")];
  const isNegative = minus || tilde;

  // Stylize the components
  const Q = NavbarHotkeyKey("Hold Q: ", q);
  const W = NavbarHotkeyKey("Hold W: ", w);
  const E = NavbarHotkeyKey("Hold E: ", e);
  const R = NavbarHotkeyKey("Hold R: ", r);
  const T = NavbarHotkeyKey("Hold T: ", t);
  const Y = NavbarHotkeyKey("Hold Y: ", y);
  const C = NavbarHotkeyKey("Hold C: ", c);
  const D = NavbarHotkeyKey("Hold D: ", d);
  const Minus = NavbarHotkeyKey("Hold Minus/Tilde: ", minus || tilde);
  const Equal = NavbarHotkeyKey("Hold Equal: ", equal);

  const isSelectingPatternClip = useAppValue(selectIsSelectingPatternClips);
  const scaleKey = qwertyKeys.find((key) => holding[getKeyCode(key)]);
  const isVoiceLeadingClosest = c && isSelectingPatternClip;
  const isVoiceLeadingDegree = d && isSelectingPatternClip;

  const getKeycodeLabel = useCallback(
    (keycode: string) => {
      if (isVoiceLeadingDegree) {
        const sign = isNegative ? "-" : "";
        const label = labelMap[scaleKey ?? "q"].label;
        const offset = `${label}${sign}${keycode}`;
        return `Closest Pose With ${offset}`;
      }

      if (isVoiceLeadingClosest) {
        return `${cardinalMap[keycode]} Closest Pose (By Distance)`;
      }

      return "No Effect Available";
    },
    [
      labelMap,
      isNegative,
      scaleKey,
      isVoiceLeadingClosest,
      isVoiceLeadingDegree,
    ]
  );

  return (
    <NavbarActionButton
      title="Gesture - Voice Leading"
      subtitle={
        isSelectingPatternClip
          ? "Create Poses by Constraint"
          : "Select a Pattern to Voice Lead"
      }
      subtitleClass="text-teal-400"
      Icon={
        isVoiceLeadingClosest || isVoiceLeadingDegree ? (
          <GiMisdirection className="text-2xl" />
        ) : (
          <GiPathDistance className="text-2xl" />
        )
      }
      background="bg-radial from-teal-900/80 to-teal-500/80"
      borderColor="border-teal-500"
      minWidth="min-w-72"
    >
      {!!isSelectingPatternClip && (
        <>
          <NavbarActionButtonOption
            title="Select Scales (Default = Q+W+E)"
            Icon={<GiDominoMask />}
            stripe="border-b-sky-500"
            subtitle={
              <ul>
                <li>
                  {Q}
                  <span className="text-sky-400">
                    Search With {labelMap.q.name}
                  </span>
                </li>
                <li>
                  {W}
                  <span className="text-sky-400">
                    Search With {labelMap.w.name}
                  </span>
                </li>
                <li>
                  {E}
                  <span className="text-sky-400">
                    Search With {labelMap.e.name}
                  </span>
                </li>
                <li>
                  {R}
                  <span className="text-sky-400">
                    Search With {labelMap.r.name}
                  </span>
                </li>
                <li>
                  {T}
                  <span className="text-sky-400">
                    Search With {labelMap.t.name}
                  </span>
                </li>
                <li>
                  {Y}
                  <span className="text-sky-400">
                    Search With {labelMap.y.name}
                  </span>
                </li>
              </ul>
            }
          />
          <NavbarActionButtonOption
            title="Select Constraints"
            Icon={<GiBugNet />}
            subtitle={
              <ul>
                <li>
                  {C}
                  <span className="text-teal-400">Voice Lead by Closeness</span>
                </li>
                <li>
                  {D}
                  <span className="text-teal-400">Voice Lead by Degree</span>
                </li>
                <li>
                  {Minus}
                  <span className="text-teal-400">Use Descending Motion</span>
                </li>
                <li>
                  {Equal}
                  <span className="text-teal-400">Use Ascending Motion</span>
                </li>
              </ul>
            }
            stripe="border-b-teal-500"
            readOnly
          />
          <NavbarActionButtonOption
            title="Create Poses By Rule"
            Icon={<ArrangePoseIcon />}
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
              </ul>
            }
            stripe="border-b-fuchsia-500"
            readOnly
          />
        </>
      )}
    </NavbarActionButton>
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
