import { ScaleTrackFormatter } from "./ScaleTrackFormatter";
import { useDeep, useProjectDispatch } from "types/hooks";
import { TrackRow } from "features/Timeline/components/TimelineGrid";
import { selectTrackById } from "types/Track/TrackSelectors";
import {
  isScaleTrackId,
  ScaleTrack,
} from "types/Track/ScaleTrack/ScaleTrackTypes";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { RenderCellProps } from "react-data-grid";
import { memo, useRef } from "react";
import { useTrackDragAndDrop } from "./hooks/useTrackDnd";
import { useTrackStyle } from "./hooks/useTrackStyle";
import { TrackDots } from "./components/TrackDots";
import { isPatternTrack } from "types/Track/TrackTypes";
import { PatternTrackFormatter } from "./PatternTrackFormatter";
import { toggleSelectedTrackId } from "types/Timeline/TimelineThunks";

export const TrackFormatter = memo((props: RenderCellProps<TrackRow>) => {
  const dispatch = useProjectDispatch();
  const trackId = props.row.id;
  const track = useDeep((_) => selectTrackById(_, trackId))!;
  const isPT = isPatternTrack(track);
  const isST = !isPT && isScaleTrackId(trackId);

  // Drag and drop logic
  const ref = useRef<HTMLDivElement>(null);
  const { isDragging, drag, drop } = useTrackDragAndDrop(trackId);
  const { className, borderClass, ...style } = useTrackStyle({
    trackId,
    isDragging,
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onClick={() => {
        dispatch(toggleSelectedTrackId({ data: trackId }));
      }}
    >
      <TrackDots trackId={trackId} />
      <div className={borderClass}>
        {isST && <ScaleTrackFormatter track={track as ScaleTrack} />}
        {isPT && <PatternTrackFormatter track={track as PatternTrack} />}
      </div>
    </div>
  );
});
