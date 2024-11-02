import classNames from "classnames";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState, useRef, useCallback } from "react";
import { ClipId } from "types/Clip/ClipTypes";
import { use } from "types/hooks";
import { getPoseVectorAsJSX } from "types/Pose/PoseFunctions";
import { PoseVector } from "types/Pose/PoseTypes";
import { selectIsClipLive } from "types/Timeline/TimelineSelectors";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { getVectorKeys } from "utils/vector";

interface PoseClipCombosProps {
  id: ClipId;
}

const DELAY = 3000;

export function PoseClipCombos(props: PoseClipCombosProps) {
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLive = use((_) => selectIsClipLive(_, props.id));

  // The pose stores a list of vectors to display the last combo
  const [vectors, setVectors] = useState<PoseVector[]>([]);
  const vectorCount = vectors.length;
  const visibleVectors = vectors.slice(0, 10);

  // Listen for keybaord shortcuts and pop in the vectors
  useCustomEventListener("add-shortcut", (e) => {
    const message = e.detail;
    if (!getVectorKeys(message).length) {
      setVectors([]);
      return;
    } else {
      setVectors((prev) => [...prev, message]);
      const timeout = comboTimeout.current;
      if (timeout) clearTimeout(timeout);
      comboTimeout.current = setTimeout(() => {
        setVectors([]);
      }, DELAY);
    }
  });

  // Any vector can be converted to JSX with the track map
  const trackMap = use(selectTrackMap);
  const getJSX = useCallback(
    (s: PoseVector) => getPoseVectorAsJSX(s, trackMap),
    [trackMap]
  );

  // The first couple of vectors are rendered and the rest are bundled together
  const renderVector = useCallback(
    (v: PoseVector, i: number) => {
      const beforeLast = i < vectorCount - 1;
      const onLast = i === 9 && vectorCount > 10;
      return (
        <div key={i} className="flex gap-2 total-center">
          <div className="border border-white/50 p-1 rounded bg-fuchsia-500">
            {getJSX(v)}
          </div>
          {beforeLast && <span className="text-white">+</span>}
          {onLast && (
            <span className="text-white">{vectorCount - 10} more</span>
          )}
        </div>
      );
    },
    [vectorCount, getJSX]
  );

  if (!isLive) return null;
  return (
    <div
      data-empty={!vectorCount}
      className="absolute -top-12 p-1 text-white rounded data-[empty=false]:animate-in data-[empty=false]:fade-in data-[empty=false]:backdrop-blur data-[empty=false]:border-white/50 data-[empty=false]:bg-fuchsia-600/30"
    >
      <div className="flex gap-2 relative size-full whitespace-nowrap">
        {visibleVectors.map(renderVector)}
      </div>
    </div>
  );
}
