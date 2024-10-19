import { FormatterProps } from "react-data-grid";
import { PatternTrackFormatter } from "./PatternTrackFormatter";
import { ScaleTrackFormatter } from "./ScaleTrackFormatter";
import { use, useProjectDispatch } from "types/hooks";
import { Row } from "features/Timeline/Timeline";
import {
  TrackId,
  Track,
  isScaleTrack,
  isPatternTrack,
} from "types/Track/TrackTypes";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import {
  selectTrackById,
  selectTrackLabelById,
  selectTrackIndexById,
  selectTrackAncestors,
} from "types/Track/TrackSelectors";
import { movePatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { moveScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { updateTrack } from "types/Track/TrackThunks";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";

export interface TrackFormatterProps {
  track?: Track;
  label?: string;
  index: number;
  isSelected: boolean;
  isAncestorSelected: boolean;

  renameTrack: (name: string) => void;
  moveTrack: (dragId: TrackId, hoverId: TrackId) => void;
}

export function TrackFormatter(props: FormatterProps<Row>) {
  const dispatch = useProjectDispatch();
  const trackId = props.row.id;
  const selectedTrackId = use(selectSelectedTrackId);
  const isSelected = trackId === selectedTrackId;
  const track = use((_) => (trackId ? selectTrackById(_, trackId) : undefined));
  const isAncestorSelected = use((_) =>
    selectTrackAncestors(_, trackId).some((t) => t?.id === selectedTrackId)
  );
  const label = use((_) => selectTrackLabelById(_, track?.id));
  const index = use((_) => selectTrackIndexById(_, track?.id));
  if (!trackId || !track) return null;

  const _renameTrack = (name: string) =>
    dispatch(updateTrack({ data: { id: trackId, name } }));

  const moveTrack = (dragId: TrackId, hoverId: TrackId) => {
    if (isScaleTrack(track)) dispatch(moveScaleTrack({ dragId, hoverId }));
    else if (isPatternTrack(track))
      dispatch(movePatternTrack({ dragId, hoverId }));
  };

  // A track passes down general props to the scale/pattern tracks
  const trackProps: TrackFormatterProps = {
    track,
    isSelected,
    isAncestorSelected,
    index,
    label,
    renameTrack: _renameTrack,
    moveTrack,
  };

  if (isScaleTrack(track)) {
    const typedTrack = track as ScaleTrack;
    return <ScaleTrackFormatter {...trackProps} track={typedTrack} />;
  }
  if (isPatternTrack(track)) {
    const typedTrack = track as PatternTrack;
    return <PatternTrackFormatter {...trackProps} track={typedTrack} />;
  }
  return (
    <div className="rdg-track size-full p-2 relative bg-slate-900/50 text-slate-50">
      Error Track: {track}
    </div>
  );
}
