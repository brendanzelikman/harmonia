import { cancelEvent, isHoldingShift, isInputEvent } from "utils";
import {
  selectEditor,
  selectOrderedTracks,
  selectSelectedMedia,
  selectSelectedTrackParents,
  selectTransport,
} from "redux/selectors";
import { useDeepEqualSelector, useAppDispatch } from "redux/hooks";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { toggleInstrumentMute, toggleInstrumentSolo } from "redux/Instrument";

import {
  offsetSelectedTranspositions,
  updateSelectedTranspositions,
} from "redux/Transposition";
import { isPatternTrack } from "types/PatternTrack";
import { TranspositionOffsetRecord } from "types/Transposition";
import {
  startRecordingTransport,
  stopRecordingTransport,
} from "redux/Transport";
import { useEffect } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

export const useTimelineLiveHotkeys = () => {
  const dispatch = useAppDispatch();
  const { recording } = useDeepEqualSelector(selectTransport);
  const editor = useDeepEqualSelector(selectEditor);
  const orderedTracks = useDeepEqualSelector(selectOrderedTracks);
  const scaleTracks = useDeepEqualSelector(selectSelectedTrackParents);

  // Update the hotkey scope when a transposition is selected
  const HotkeyScope = useHotkeysContext();
  const mediaSelection = useDeepEqualSelector(selectSelectedMedia);
  useEffect(() => {
    if (
      !!mediaSelection.length &&
      !HotkeyScope.enabledScopes.includes("mediaShortcuts")
    ) {
      HotkeyScope.enableScope("mediaShortcuts");
      HotkeyScope.disableScope("timeline");
    } else if (
      !mediaSelection.length &&
      !HotkeyScope.enabledScopes.includes("timeline")
    ) {
      HotkeyScope.disableScope("mediaShortcuts");
      HotkeyScope.enableScope("timeline");
    }
  }, [mediaSelection, HotkeyScope.enabledScopes]);

  const keyMap: Record<string, string> = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "-": "10",
    "=": "11",
  };

  const CHROMATIC_BINDS: Record<string, number> = {
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

  const SCALAR_BINDS: Record<string, number> = {
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

  const CHORDAL_BINDS: Record<string, number> = {
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

  const zeroKeys = ["0", "y", "h", "n", "z"];
  const keys = ["`", "q", "w", "s", "x", "f", "e", "z", "y", "u"];
  const heldKeys = useHeldHotkeys([
    "shift",
    "backspace",
    "meta",
    "meta+y",
    "meta+u",
    ...keys,
    ...zeroKeys,
    "alt+y",
    "alt+u",
  ]);

  useHotkeys(
    "shift+r",
    () =>
      recording
        ? dispatch(stopRecordingTransport())
        : dispatch(startRecordingTransport()),
    [recording]
  );

  const keyKeydown = (e: KeyboardEvent) => {
    // Get the number of the key
    const number = parseInt(e.key);
    // if (isNaN(number)) return;

    // Get the pattern track by number (for mute/solo)
    if (!isNaN(number)) {
      const patternTracks = orderedTracks.filter(isPatternTrack);
      const patternTrack = patternTracks[number - 1];
      const instrumentId = patternTrack?.instrumentId;

      // Toggle mute if holding y
      if (heldKeys.meta && heldKeys.y) {
        e.preventDefault();
        dispatch(toggleInstrumentMute(instrumentId));
      }
      // Toggle solo if holding u
      if (heldKeys.meta && heldKeys.u) {
        e.preventDefault();
        dispatch(toggleInstrumentSolo(instrumentId));
      }
    }

    // Compute the initial offset based on up/down/shift
    const offsets = {} as TranspositionOffsetRecord;
    // const negative = heldKeys["`"];
    // const dir = negative ? -1 : 1;
    let offset = isHoldingShift(e) ? 5 : 0;
    if (e.key in CHROMATIC_BINDS && !heldKeys.meta) {
      offsets._chromatic = offset + CHROMATIC_BINDS[e.key];
    }
    if (e.key in SCALAR_BINDS && !heldKeys.meta) {
      const scaleId = scaleTracks?.[0]?.id;
      if (scaleId) {
        offsets[scaleId] = offset + SCALAR_BINDS[e.key];
      }
    }
    if (e.key in CHORDAL_BINDS && !heldKeys.meta) {
      offsets._self = offset + CHORDAL_BINDS[e.key];
    }

    // // Apply chromatic offset if holding q
    // if (heldKeys.q) {
    //   offsets._chromatic = offset;
    // }

    // // Apply scalar offsets if holding w, s, or x
    // const scalarKeys = ["w", "s", "x"];
    // scalarKeys.forEach((key) => {
    //   const keyIndex = scalarKeys.indexOf(key);
    //   const heldKey = heldKeys[key];
    //   const id = scaleTracks[keyIndex]?.id;
    //   if (heldKey && id) offsets[id] = offset;
    // });

    // // Apply chordal offset if holding e
    // if (heldKeys.e) {
    //   offsets._self = offset;
    // }
    if (Object.keys(offsets).length) {
      dispatch(offsetSelectedTranspositions(offsets));
    }
  };

  const zeroKeydown = (e: KeyboardEvent) => {
    const key = e.key;
    if (!zeroKeys.includes(key)) return;

    // Unmute all tracks if holding y
    // if (isHotkeyPressed("alt") && isHotkeyPressed("y")) {
    //   dispatch(unmuteTracks());
    // }

    // // Unsolo all tracks if holding u
    // if (isHotkeyPressed("alt") && isHotkeyPressed("u")) {
    //   dispatch(unsoloTracks());
    // }

    // Reset all offsets if holding z
    // if (key === "z") {
    //   dispatch(resetSelectedTranspositions());
    //   return;
    // }

    const offsets = {} as TranspositionOffsetRecord;
    if (e.key === "y") {
      offsets._chromatic = 0;
    }
    if (e.key === "h") {
      const scaleId = scaleTracks?.[0]?.id;
      if (scaleId) {
        offsets[scaleId] = 0;
      }
    }
    if (e.key === "n") {
      offsets._self = 0;
    }

    // Reset the chromatic offset if holding q
    // if (heldKeys.q) {
    //   offsets._chromatic = 0;
    // }

    // // Reset the scalar offsets if holding w, s, or x
    // const scalarKeys = ["w", "s", "x"];
    // scalarKeys.forEach((key) => {
    //   const keyIndex = scalarKeys.indexOf(key);
    //   const heldKey = heldKeys[key];
    //   const id = scaleTracks[keyIndex]?.id;
    //   if (heldKey && id) offsets[id] = 0;
    // });

    // // Reset the chordal offset if holding e
    // if (heldKeys.e) {
    //   offsets._self = 0;
    // }

    if (Object.keys(offsets).length) {
      dispatch(updateSelectedTranspositions(offsets));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyKeydown);
    window.addEventListener("keydown", zeroKeydown);

    return () => {
      window.removeEventListener("keydown", keyKeydown);
      window.removeEventListener("keydown", zeroKeydown);
    };
  }, [keyKeydown, zeroKeydown]);

  //   // 1 = Transpose by 1/13 steps
  //   useHotkeys(["1", "shift+1"], keyKeydown, [keyKeydown]);

  //   // 2 = Transpose by 2/14 steps
  //   useHotkeys(["2", "shift+2"], keyKeydown, [keyKeydown]);

  //   // 3 = Transpose by 3/15 steps
  //   useHotkeys(["3", "shift+3"], keyKeydown, [keyKeydown]);

  //   // 4 = Transpose by 4/16 steps
  //   useHotkeys(["4", "shift+4"], keyKeydown, [keyKeydown]);

  //   // 5 = Transpose by 5/17 steps
  //   useHotkeys(["5", "shift+5"], keyKeydown, [keyKeydown]);

  //   // 6 = Transpose by 6/18 steps
  //   useHotkeys(["6", "shift+6"], keyKeydown, [keyKeydown]);

  //   // 7 = Transpose by 7/19 steps
  //   useHotkeys(["7", "shift+7"], keyKeydown, [keyKeydown]);

  //   // 8 = Transpose by 8/20 steps
  //   useHotkeys(["8", "shift+8"], keyKeydown, [keyKeydown]);

  //   // 9 = Transpose by 9/21 steps
  //   useHotkeys(["9", "shift+9"], keyKeydown, [keyKeydown]);

  //   // "-" = Transpose by 10/22 steps
  //   useHotkeys(["-", "shift+-", "_", "shift+_"], keyKeydown, [keyKeydown]);

  //   // "=" = Transpose by 11/23 steps
  //   useHotkeys(
  //     ["=", "+", "shift&=", "shift&+"],
  //     keyKeydown,
  //     { combinationKey: "&" },
  //     [keyKeydown]
  //   );

  // "0" = Reset selected offsets, "z" = Reset all offsets
  useHotkeys(["0", "y", "h", "n", "z"], zeroKeydown, [zeroKeydown]);

  // Up arrow = Transpose up by 1/12 steps
  useHotkeys(
    ["up", "shift+up"],
    (e) => {
      if (isInputEvent(e) || editor.show) return;
      cancelEvent(e);

      // Offset the selected transpositions
      const holdingShift = isHoldingShift(e);
      // const N = heldKeys.q ? (holdingShift ? 12 : 1) : 0;
      // const T1 = heldKeys.w ? (holdingShift ? 12 : 1) : 0;
      // const T2 = heldKeys.s ? (holdingShift ? 12 : 1) : 0;
      // const T3 = heldKeys.x ? (holdingShift ? 12 : 1) : 0;
      // const t = heldKeys.e ? (holdingShift ? 12 : 1) : 0;
      // dispatch(
      //   offsetSelectedTranspositions({
      //     _chromatic: N,
      //     [scaleTracks?.[0]?.id ?? ""]: T1,
      //     [scaleTracks?.[1]?.id ?? ""]: T2,
      //     [scaleTracks?.[2]?.id ?? ""]: T3,
      //     _self: t,
      //   })
      // );
    },
    [editor.show, scaleTracks]
  );

  // Down arrow = Transpose down by 1/12 steps
  useHotkeys(
    ["down", "shift+down"],
    (e) => {
      if (isInputEvent(e) || editor.show) return;
      cancelEvent(e);

      // Offset the selected transpositions
      // const holdingShift = isHoldingShift(e);
      // const N = heldKeys.q ? (holdingShift ? -12 : -1) : 0;
      // const T1 = heldKeys.w ? (holdingShift ? -12 : -1) : 0;
      // const T2 = heldKeys.s ? (holdingShift ? -12 : -1) : 0;
      // const T3 = heldKeys.x ? (holdingShift ? -12 : -1) : 0;
      // const t = heldKeys.e ? (holdingShift ? -12 : -1) : 0;
      // dispatch(
      //   offsetSelectedTranspositions({
      //     ...{
      //       _chromatic: N,
      //       _self: t,
      //     },
      //     [scaleTracks?.[0]?.id ?? ""]: T1,
      //     [scaleTracks?.[1]?.id ?? ""]: T2,
      //     [scaleTracks?.[2]?.id ?? ""]: T3,
      //   })
      // );
    },
    [editor.show]
  );
};
