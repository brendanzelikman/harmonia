import { isHoldingShift, isInputEvent } from "utils/html";
import {
  useProjectDeepSelector,
  useProjectDispatch,
  useProjectSelector,
} from "types/hooks";
import { useCallback, useEffect } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getDictKeys, hasKeys } from "utils/objects";
import { useSubscription } from "providers/subscription";
import {
  toggleInstrumentMute,
  toggleInstrumentSolo,
} from "types/Instrument/InstrumentSlice";
import { PoseVector } from "types/Pose/PoseTypes";
import { isTimelineLive } from "types/Timeline/TimelineFunctions";
import { isPatternTrack } from "types/Track/TrackTypes";
import { selectEditor } from "types/Editor/EditorSelectors";
import {
  selectTimeline,
  selectSelectedTrackParents,
} from "types/Timeline/TimelineSelectors";
import { selectTracks } from "types/Track/TrackSelectors";
import {
  offsetSelectedPoses,
  updateSelectedPoses,
  updateSelectedPoseStreams,
} from "types/Pose/PoseThunks";
import { unmuteTracks, unsoloTracks } from "types/Track/TrackThunks";
import { mapPoseStreamVectors } from "types/Pose/PoseFunctions";

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
  o: 12,
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

  // Get additional dependencies from the store
  const editor = useProjectDeepSelector(selectEditor);
  const orderedTracks = useProjectDeepSelector(selectTracks);
  const scaleTracks = useProjectDeepSelector(selectSelectedTrackParents);

  // Get the keys for the current pose mode
  const keys = getDictKeys(NUMERICAL_BINDS);

  // Get the list of zero keys based on the pose mode
  const zeroKeys = NUMERICAL_ZERO_BINDS;

  // Extra keys required for each mode
  const extraKeys = ["`", "t", "q", "w", "e", "r", "m", "s", "o", "y"];

  // Track all of the held keys
  const allKeys = ["shift", "meta", ...keys, ...zeroKeys, ...extraKeys];
  const heldKeys = useHeldHotkeys(allKeys, [allKeys]);

  // The callback for the numerical keydown event
  const numericalKeydown = (e: KeyboardEvent) => {
    if (isInputEvent(e) || editor.view) return;

    const negative = heldKeys["`"];

    // Try to get the number of the key
    const number = parseInt(e.key);
    if (isNaN(number)) return;

    // Get the pattern track by number (for mute/solo)
    const patternTracks = orderedTracks.filter(isPatternTrack);
    const patternTrack = patternTracks[number - 1];
    const instrumentId = patternTrack?.instrumentId;

    // Toggle mute if holding y
    if (heldKeys.m) {
      dispatch(toggleInstrumentMute(instrumentId));
    }
    // Toggle solo if holding u
    if (heldKeys.s) {
      dispatch(toggleInstrumentSolo(instrumentId));
    }

    // Compute the pose offset record
    const vector = {} as PoseVector;
    const dir = negative ? -1 : 1;
    const octave = e.key === "o";
    const value = (octave ? 12 : number) * dir;

    // Apply chordal offset if holding r
    if (heldKeys.r) {
      vector.chordal = (vector.chordal ?? 0) + value;
    }

    // Apply chromatic offset if holding t
    if (heldKeys.t) {
      vector.chromatic = (vector.chromatic ?? 0) + value;
    }

    // Apply octave offset if holding y
    if (heldKeys.y) {
      vector.octave = (vector.octave ?? 0) + value;
    }

    // Apply scalar offsets if holding w, s, or x
    const scalarKeys = ["q", "w", "e"];
    scalarKeys.forEach((key) => {
      const keyIndex = scalarKeys.indexOf(key);
      const heldKey = heldKeys[key];
      const id = scaleTracks[keyIndex]?.id;
      if (heldKey && id) vector[id] = (vector[id] ?? 0) + value;
    });

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

      // Unmute all tracks if holding m
      if (heldKeys.m) {
        dispatch(unmuteTracks());
      }

      // Unsolo all tracks if holding s
      if (heldKeys.s) {
        dispatch(unsoloTracks());
      }

      const scaleKeys = ["q", "w", "e"];
      const isZ = key === "z";

      dispatch(
        updateSelectedPoseStreams((stream) =>
          mapPoseStreamVectors(stream, (vec) => {
            let newVector = { ...vec };

            if (heldKeys[scaleKeys[0]]) {
              if (isZ) {
                delete newVector[scaleTracks[0].id];
              } else {
                newVector[scaleTracks[0].id] = 0;
              }
            }
            if (heldKeys[scaleKeys[1]]) {
              if (isZ) {
                delete newVector[scaleTracks[1].id];
              } else {
                newVector[scaleTracks[1].id] = 0;
              }
            }
            if (heldKeys[scaleKeys[2]]) {
              if (isZ) {
                delete newVector[scaleTracks[2].id];
              } else {
                newVector[scaleTracks[2].id] = 0;
              }
            }
            if (heldKeys.r) {
              if (isZ) {
                delete newVector.chordal;
              } else {
                newVector.chordal = 0;
              }
            }
            if (heldKeys.t) {
              if (isZ) {
                delete newVector.chromatic;
              } else {
                newVector.chromatic = 0;
              }
            }
            if (heldKeys.y) {
              if (isZ) {
                delete newVector.octave;
              } else {
                newVector.octave = 0;
              }
            }
            if (Object.keys(newVector).length === Object.keys(vec).length) {
              if (isZ) return {};
            }
            return newVector;
          })
        )
      );
    },
    [heldKeys, zeroKeys, editor, scaleTracks]
  );

  // The callback for the alphabetical zero keydown event
  const alphabeticalZeroKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (!zeroKeys.includes(key)) return;
      if (isInputEvent(e) || editor.view) return;

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
    const keydown = numericalKeydown;
    const zeroKeydown = numericalZeroKeydown;

    window.addEventListener("keydown", keydown);
    window.addEventListener("keydown", zeroKeydown);

    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keydown", zeroKeydown);
    };
  }, [isAtLeastStatus, isLive, numericalKeydown, numericalZeroKeydown]);
};
