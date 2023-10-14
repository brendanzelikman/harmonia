import { Transition } from "@headlessui/react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useCallback } from "react";
import { useAppSelector, useDeepEqualSelector } from "redux/hooks";
import {
  selectScaleTrackMap,
  selectTrackParents,
  selectSelectedTrack,
  selectSelectedTranspositions,
} from "redux/selectors";
import { Scale, getScaleTag } from "types/Scale";
import { getScaleTrackScale } from "types/ScaleTrack";
import { SHIFTED_KEY_MAP } from "utils";

export const ToolkitKeypad = () => {
  const selectedTrack = useDeepEqualSelector(selectSelectedTrack);
  const scaleTrackMap = useAppSelector(selectScaleTrackMap);
  const onScaleTrack = selectedTrack?.type === "scaleTrack";
  const parents = useDeepEqualSelector((state) =>
    selectTrackParents(state, selectedTrack?.id).slice(onScaleTrack ? 1 : 0)
  );
  const scales = parents.map((t) => getScaleTrackScale(t, scaleTrackMap));

  const selectedTranspositions = useDeepEqualSelector(
    selectSelectedTranspositions
  );
  const isLive = !!selectedTranspositions.length;
  const keys = [...new Array(9).fill(0).map((_, i) => `${i + 1}`)];
  const heldKeys = useHeldHotkeys([
    "q",
    "w",
    "s",
    "x",
    "e",
    ...keys,
    "shift",
    "`",
    "~",
  ]);
  const isHoldingKey = (key: string) =>
    heldKeys[key] || heldKeys[SHIFTED_KEY_MAP[key]];

  const isHoldingShift = heldKeys.shift;
  const isHoldingNegative = isHoldingKey("`");

  // The chromatic label
  const ChromaticLabel = () => {
    const isHoldingQ = heldKeys.q;
    return (
      <>
        <span className={`${isHoldingQ ? "text-white font-bold" : ""}`}>
          {isHoldingQ && isHoldingNegative ? "-" : ""}N
        </span>
        <span className="ml-1">•</span>
      </>
    );
  };

  // The scalar labels
  const ScalarLabel = (scale: Scale, i: number) => {
    const isHoldingW = i === 0 && heldKeys.w;
    const isHoldingS = i === 1 && heldKeys.s;
    const isHoldingX = i === 2 && heldKeys.x;
    const isHoldingKey = isHoldingW || isHoldingS || isHoldingX;
    const textClass = isHoldingKey ? "text-white font-bold" : "";
    return (
      <div key={getScaleTag(scale)} className={`inline`}>
        <span className={`ml-1 ${textClass}`}>
          T{scales.length > 1 ? i + 1 : ""}
        </span>
        <span className="ml-1">{i < scales.length ? "•" : ""}</span>
      </div>
    );
  };
  const ScalarLabels = () => {
    if (!scales.length) return null;
    return <>{scales.map(ScalarLabel)}</>;
  };

  // The chordal label
  const ChordalLabel = () => {
    const isHoldingE = heldKeys.e;
    return (
      <span className={`ml-1 ${isHoldingE ? "text-white font-bold" : ""}`}>
        {isHoldingE && isHoldingNegative ? "-" : ""}t
      </span>
    );
  };

  // The transpose label showing the current types of transpositions available.
  const TransposeLabel = () => {
    const modifier = isHoldingShift ? 12 : 0;
    return (
      <>
        <label className="w-full flex justify-center text-slate-400">
          <span className="text-fuchsia-500 mr-1">Transpose</span>
          (<ChromaticLabel /> <ScalarLabels /> <ChordalLabel />)
          {!!modifier && <span className="ml-1">(+{modifier})</span>}
        </label>
      </>
    );
  };

  // Render a transposition key
  const renderKey = useCallback(
    (key: string, i: number) => {
      const textClass = isHoldingKey(key) ? "text-fuchsia-400 font-bold" : "";
      const value = i + 1;
      return (
        <li key={`keypad-${key}`}>
          <label className={textClass}>{value}</label>
          {i < keys.length - 1 && <span className="ml-1">-</span>}
        </li>
      );
    },
    [isHoldingKey]
  );

  const NumberedKeys = () => {
    return <ol className="flex w-full space-x-1">{keys.map(renderKey)}</ol>;
  };

  return (
    <Transition
      show={isLive}
      enter="transition-all duration-300"
      enterFrom="opacity-0 scale-0"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-0"
      as="div"
      className="flex font-nunito font-light text-xs rounded-lg px-2 py-1 border border-fuchsia-500 select-none"
    >
      <div className="w-full flex flex-col justify-center items-center text-slate-400">
        {TransposeLabel()}
        <NumberedKeys />
      </div>
    </Transition>
  );
};
