import { cancelEvent, isHoldingShift, isInputEvent } from "utils/html";
import {
  selectEditor,
  selectSelectedTrackParents,
  selectLivePlaySettings,
  selectTimeline,
  selectTracks,
} from "redux/selectors";
import {
  useProjectDeepSelector,
  useProjectDispatch,
  useProjectSelector,
} from "redux/hooks";
import { useHotkeys } from "react-hotkeys-hook";
import { toggleInstrumentMute, toggleInstrumentSolo } from "redux/Instrument";

import { offsetSelectedPoses, updateSelectedPoses } from "redux/Pose";
import { isPatternTrack } from "types/Track";
import { PoseVector } from "types/Pose";
import { useCallback, useEffect } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { unmuteTracks, unsoloTracks } from "redux/Track";
import { getKeys, hasKeys } from "utils/objects";
import { isTimelineLive } from "types/Timeline";
import { toggleLivePlay } from "redux/Timeline";
import { useSubscription } from "providers/subscription";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";

type KeyBinds = Record<string, number>;

/**
 * The numerical binds use the top number row.
 */
const NUMERICAL_BINDS: KeyBinds = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "-": 10,
  "=": 11,
};
const NUMERICAL_ZERO_BINDS = ["z", "0"];

/**
 * The chromatic binds use the top key row.
 */
const CHROMATIC_BINDS = {
  q: -5,
  w: -4,
  e: -3,
  r: -2,
  t: -1,
  u: 1,
  i: 2,
  o: 3,
  p: 4,
  "[": 5,
};

/**
 * The scalar binds use the middle key row.
 */
const SCALAR_BINDS = {
  a: -5,
  s: -4,
  d: -3,
  f: -2,
  g: -1,
  j: 1,
  k: 2,
  l: 3,
  ";": 4,
  "'": 5,
};

/**
 * The chordal binds use the bottom key row.
 * (Note that there is no room for t5).
 */
const CHORDAL_BINDS = {
  z: -5,
  x: -4,
  c: -3,
  v: -2,
  b: -1,
  m: 1,
  ",": 2,
  ".": 3,
  "/": 4,
};

const ALPHABETICAL_BINDS: Record<string, KeyBinds> = {
  chromatic: CHROMATIC_BINDS,
  scalar: SCALAR_BINDS,
  chordal: CHORDAL_BINDS,
};
const ALPHABETICAL_ZERO_BINDS = ["y", "h", "n", "`", "0"];

export const useTimelineLiveHotkeys = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastStatus } = useSubscription();

  // Get the timeline from the store
  const timeline = useProjectSelector(selectTimeline);
  const isLive = isTimelineLive(timeline);

  // Get the live pose settings
  const livePlay = useProjectSelector(selectLivePlaySettings);
  const poseMode = livePlay.mode;
  const isNumerical = poseMode === "numerical";

  // Get additional dependencies from the store
  const editor = useProjectDeepSelector(selectEditor);
  const orderedTracks = useProjectDeepSelector(selectTracks);
  const scaleTracks = useProjectDeepSelector(selectSelectedTrackParents);

  // Get the keys for the current pose mode
  const keys = isNumerical
    ? getKeys(NUMERICAL_BINDS)
    : getKeys([CHROMATIC_BINDS, SCALAR_BINDS, CHORDAL_BINDS]);

  // Get the list of zero keys based on the pose mode
  const zeroKeys = isNumerical ? NUMERICAL_ZERO_BINDS : ALPHABETICAL_ZERO_BINDS;

  // Extra keys required for each mode
  const extraKeys = isNumerical
    ? ["`", "q", "w", "s", "x", "e", "y", "u", "o"]
    : ["`", "]", "\\", "+"];

  // Track all of the held keys
  const allKeys = ["shift", "meta", ...keys, ...zeroKeys, ...extraKeys];
  const heldKeys = useHeldHotkeys(allKeys, [allKeys]);

  // The callback for the numerical keydown event
  const numericalKeydown = (e: KeyboardEvent) => {
    if (isInputEvent(e) || editor.view) return;

    const negative = heldKeys["`"];

    // Try to get the number of the key
    const number = parseInt(e.key);
    if (e.key === "o") {
      const offset = negative ? -12 : 12;
      dispatch(offsetSelectedPoses({ chromatic: offset }));
      return;
    }
    if (isNaN(number)) return;

    // Get the pattern track by number (for mute/solo)
    const patternTracks = orderedTracks.filter(isPatternTrack);
    const patternTrack = patternTracks[number - 1];
    const instrumentId = patternTrack?.instrumentId;

    // Toggle mute if holding y
    if (heldKeys.y) {
      dispatch(toggleInstrumentMute(instrumentId));
    }
    // Toggle solo if holding u
    if (heldKeys.u) {
      dispatch(toggleInstrumentSolo(instrumentId));
    }

    // Compute the pose offset record
    const vector = {} as PoseVector;
    const dir = negative ? -1 : 1;
    const offset = isHoldingShift(e) ? 12 : 0;

    // Apply chromatic offset if holding q
    if (heldKeys.q) {
      vector.chromatic = (offset + number) * dir;
    }

    // Apply scalar offsets if holding w, s, or x
    const scalarKeys = ["w", "s", "x"];
    scalarKeys.forEach((key) => {
      const keyIndex = scalarKeys.indexOf(key);
      const heldKey = heldKeys[key];
      const id = scaleTracks[keyIndex]?.id;
      if (heldKey && id) vector[id] = (offset + number) * dir;
    });

    // Apply chordal offset if holding e
    if (heldKeys.e) {
      vector.chordal = (offset + number) * dir;
    }

    if (!hasKeys(vector)) return;
    dispatch(offsetSelectedPoses(vector));
  };

  // The callback for the keyrow keydown event
  const alphabeticalKeydown = (e: KeyboardEvent) => {
    // Get the number of the key
    const number = parseInt(e.key);

    // Get the pattern track by number (for mute/solo)
    if (!isNaN(number)) {
      const patternTracks = orderedTracks.filter(isPatternTrack);
      const patternTrack = patternTracks[number - 1];
      const instrumentId = patternTrack?.instrumentId;

      // Toggle mute if holding -
      if (heldKeys["]"]) {
        dispatch(toggleInstrumentMute(instrumentId));
      }
      // Toggle solo if holding =
      if (heldKeys[`\\`]) {
        dispatch(toggleInstrumentSolo(instrumentId));
      }
    }

    // Compute the initial offset based on up/down/shift
    let vector = {} as PoseVector;
    let offset = isHoldingShift(e) ? 5 : 0;

    if (e.key in ALPHABETICAL_BINDS.chromatic && !heldKeys.meta) {
      vector.chromatic = offset + ALPHABETICAL_BINDS.chromatic[e.key];
    }
    if (e.key in ALPHABETICAL_BINDS.scalar && !heldKeys.meta) {
      const scaleId = scaleTracks?.[0]?.id;
      if (scaleId) {
        vector[scaleId] = offset + ALPHABETICAL_BINDS.scalar[e.key];
      }
    }
    if (e.key in ALPHABETICAL_BINDS.chordal && !heldKeys.meta) {
      vector.chordal = offset + ALPHABETICAL_BINDS.chordal[e.key];
    }

    if (!hasKeys(vector)) return;
    dispatch(offsetSelectedPoses(vector));
  };

  // The callback for the numerical zero keydown event
  const numericalZeroKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (!zeroKeys.includes(key)) return;
      if (isInputEvent(e) || editor.view) return;

      // Unmute all tracks if holding y
      if (heldKeys.y) {
        dispatch(unmuteTracks());
      }

      // Unsolo all tracks if holding u
      if (heldKeys.u) {
        dispatch(unsoloTracks());
      }

      const vector: PoseVector = {};
      if (heldKeys.q) {
        vector.chromatic = 0;
      }
      const scaleKeys = ["w", "s", "x"];
      for (const scaleKey of scaleKeys) {
        if (heldKeys[scaleKey]) {
          const scaleId = scaleTracks[scaleKeys.indexOf(scaleKey)]?.id;
          if (scaleId) {
            vector[scaleId] = 0;
          }
        }
      }
      if (heldKeys.e) {
        vector.chordal = 0;
      }
      if (!hasKeys(vector)) return;
      dispatch(updateSelectedPoses(vector));
    },
    [heldKeys, zeroKeys, editor, scaleTracks]
  );

  // The callback for the alphabetical zero keydown event
  const alphabeticalZeroKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (!zeroKeys.includes(key)) return;
      if (isInputEvent(e) || editor.view) return;
      cancelEvent(e);

      // Unmute all tracks if holding -
      if (heldKeys["]"]) {
        dispatch(unmuteTracks());
      }
      // Unsolo all tracks if holding =
      if (heldKeys["\\"]) {
        dispatch(unsoloTracks());
      }

      const vector: PoseVector = {};
      if (key === "y") {
        vector.chromatic = 0;
      }
      if (key === "h") {
        const scaleId = scaleTracks?.[0]?.id;
        if (scaleId) {
          vector[scaleId] = 0;
        }
      }
      if (key === "n") {
        vector.chordal = 0;
      }
      if (key === "`") {
        vector.chromatic = 0;
        const scaleId = scaleTracks?.[0]?.id;
        if (scaleId) {
          vector[scaleId] = 0;
        }
        vector.chordal = 0;
      }
      if (!hasKeys(vector)) return;
      dispatch(updateSelectedPoses(vector));
    },
    [heldKeys, zeroKeys, editor, scaleTracks]
  );

  /**
   * Add the corresponding event listener to the window if the user is live.
   * (This is a workaround for duplicated events with react-hotkeys)
   */
  useEffect(() => {
    if (!isLive || !isAtLeastStatus("maestro")) return;
    const keydown = isNumerical ? numericalKeydown : alphabeticalKeydown;
    const zeroKeydown = isNumerical
      ? numericalZeroKeydown
      : alphabeticalZeroKeydown;

    window.addEventListener("keydown", keydown);
    window.addEventListener("keydown", zeroKeydown);

    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keydown", zeroKeydown);
    };
  }, [
    isAtLeastStatus,
    isLive,
    isNumerical,
    numericalKeydown,
    alphabeticalKeydown,
    numericalZeroKeydown,
    alphabeticalZeroKeydown,
  ]);

  useHotkeys("shift+t", () => dispatch(toggleLivePlay()));
};
