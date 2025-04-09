import { ScaleTrackFormatter } from "./renderers/Tracks/ScaleTrackFormatter";
import { useStore, useDispatch } from "hooks/useStore";
import { selectTrackById } from "types/Track/TrackSelectors";
import {
  isScaleTrackId,
  ScaleTrack,
} from "types/Track/ScaleTrack/ScaleTrackTypes";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { RenderCellProps } from "react-data-grid";
import { memo, useRef } from "react";
import { useTrackDragAndDrop } from "./renderers/Tracks/hooks/useTrackDnd";
import { useTrackStyle } from "./renderers/Tracks/hooks/useTrackStyle";
import { TrackDots } from "./renderers/Tracks/components/TrackDots";
import { isPatternTrack } from "types/Track/TrackTypes";
import { PatternTrackFormatter } from "./renderers/Tracks/PatternTrackFormatter";
import { toggleSelectedTrackId } from "types/Timeline/TimelineThunks";
import { TrackRow } from "./Timeline";

export const TimelineTrack = memo((props: RenderCellProps<TrackRow>) => {
  const dispatch = useDispatch();
  const trackId = props.row.id;
  const track = useStore((_) => selectTrackById(_, trackId))!;
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
