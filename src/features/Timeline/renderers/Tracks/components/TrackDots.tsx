import { memo } from "react";
import { useStore } from "hooks/useStore";
import { selectTrackDepthById } from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";

export const TrackDots = memo(({ trackId }: { trackId: TrackId }) => {
  const depth = useStore((_) => selectTrackDepthById(_, trackId));
  return (
    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs">
      {new Array(depth - 1).fill(null).map((_, i) => (
        <div key={i} className={"inline-flex w-2"}>
          •
        </div>
      ))}
    </div>
  );
});
