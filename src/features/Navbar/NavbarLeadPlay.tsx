import { useAppDispatch, useAppValue } from "hooks/useRedux";
import {
  GiDominoMask,
  GiMisdirection,
  GiPathDistance,
  GiToolbox,
} from "react-icons/gi";
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
import { selectHasTracks } from "types/Track/TrackSelectors";
import { getKeyCode } from "hooks/useHeldkeys";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { selectHasGame } from "types/Game/GameSelectors";
import {
  NavbarHotkeyInstruction,
  NavbarHotkeyKey,
} from "./components/NavbarHotkeys";
import { useGestures } from "lib/gestures";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";
import { ArrangePoseIcon } from "lib/hotkeys/timeline";

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

  const zeroLabel = useMemo(() => {
    if (isPosing) {
      return "Clear Scalar Offsets";
    }
    if (isSelectingPoseClip) {
      return "Remove All Values";
    } else {
      return "Go to Root";
    }
  }, [isPosing, isSelectingPoseClip]);

  const Q = NavbarHotkeyKey("Hold Q: ", holding[getKeyCode("q")]);
  const W = NavbarHotkeyKey("Hold W: ", holding[getKeyCode("w")]);
  const E = NavbarHotkeyKey("Hold E: ", holding[getKeyCode("e")]);
  const R = NavbarHotkeyKey("Hold R: ", holding[getKeyCode("r")]);
  const T = NavbarHotkeyKey("Hold T: ", holding[getKeyCode("t")]);
  const Y = NavbarHotkeyKey("Hold Y: ", holding[getKeyCode("y")]);
  const C = NavbarHotkeyKey("Hold C: ", holding[getKeyCode("c")]);
  const D = NavbarHotkeyKey("Hold D: ", holding[getKeyCode("d")]);
  const Minus = NavbarHotkeyKey(
    "Hold Minus/Tilde: ",
    holding[getKeyCode("-")] || holding[getKeyCode("`")]
  );
  const Equal = NavbarHotkeyKey("Hold Equal: ", holding[getKeyCode("=")]);

  return (
    <NavbarActionButton
      title="Gesture - Voice Leading"
      subtitle={
        isSelectingPatternClip
          ? "Create Poses by Closeness or Degree"
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
            title="Select Scales"
            Icon={<GiDominoMask />}
            stripe="border-b-sky-500"
            subtitle={
              <ul>
                <li>
                  {Q}
                  <span className="text-sky-400">Search By {scaleName1}</span>
                </li>
                <li>
                  {W}
                  <span className="text-sky-400">Search By {scaleName2}</span>
                </li>
                <li>
                  {E}
                  <span className="text-sky-400">Search By {scaleName3}</span>
                </li>
                <li>
                  {R}
                  <span className="text-sky-400">Search By Rotation (r)</span>
                </li>
                <li>
                  {T}
                  <span className="text-sky-400">Search By Semitone (t)</span>
                </li>
                <li>
                  {Y}
                  <span className="text-sky-400">Search By Octave (y)</span>
                </li>
              </ul>
            }
          />
          <NavbarActionButtonOption
            title="Select Mode"
            Icon={<GiToolbox />}
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
            title="Create Poses"
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
                <li>
                  <NavbarHotkeyInstruction label="Press 0:" />{" "}
                  <span className="text-fuchsia-300">{zeroLabel}</span>
                </li>
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
