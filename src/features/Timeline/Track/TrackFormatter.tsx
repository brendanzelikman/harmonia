import { FormatterProps } from "react-data-grid";
import { PatternTrackFormatter } from "./PatternTrackFormatter";
import { ScaleTrackFormatter } from "./ScaleTrackFormatter";
import { Row } from "../Timeline";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import * as _ from "redux/Track";
import {
  selectCell,
  selectSelectedTrackId,
  setSelectedTrackId,
} from "redux/Timeline";
import {
  PatternTrack,
  ScaleTrack,
  Track,
  TrackId,
  isPatternTrack,
  isScaleTrack,
} from "types/Track";
import {
  selectTrackById,
  selectTrackIndexById,
  selectTrackLabelById,
} from "redux/Track";
import { TimelineCell } from "types/Timeline";

export interface TrackFormatterProps {
  cell: TimelineCell;
  track?: Track;
  label?: string;
  index: number;
  isSelected: boolean;

  renameTrack: (name: string) => void;
  moveTrack: (dragId: TrackId, hoverId: TrackId) => void;
  selectTrack: () => void;
  clearTrack: () => void;
  deleteTrack: () => void;
  duplicateTrack: () => void;
  collapseTrack: () => void;
  expandTrack: () => void;
  collapseChildren: () => void;
  expandChildren: () => void;
}

export function TrackFormatter(props: FormatterProps<Row>) {
  const dispatch = useProjectDispatch();
  const cell = useProjectSelector(selectCell);
  const trackId = props.row.trackId;
  const isSelected = trackId === useProjectSelector(selectSelectedTrackId);
  const track = useProjectSelector((_) => selectTrackById(_, trackId));
  const label = useProjectSelector((_) => selectTrackLabelById(_, track?.id));
  const index = useProjectSelector((_) => selectTrackIndexById(_, track?.id));
  if (!trackId || !track) return null;

  const renameTrack = (name: string) =>
    dispatch(_.renameTrack({ id: trackId, name }));

  const moveTrack = (dragId: TrackId, hoverId: TrackId) => {
    if (isScaleTrack(track)) dispatch(_.moveScaleTrack({ dragId, hoverId }));
    if (isPatternTrack(track))
      dispatch(_.movePatternTrack({ dragId, hoverId }));
  };

  const selectTrack = () => dispatch(setSelectedTrackId(trackId));
  const clearTrack = () => dispatch(_.clearTrack(trackId));
  const deleteTrack = () => dispatch(_.deleteTrack(trackId));
  const duplicateTrack = () => dispatch(_.duplicateTrack(trackId));
  const collapseTrack = () => dispatch(_.collapseTracks([trackId]));
  const expandTrack = () => dispatch(_.expandTracks([trackId]));
  const collapseChildren = () => dispatch(_.collapseTrackChildren(trackId));
  const expandChildren = () => dispatch(_.expandTrackChildren(trackId));

  // A track passes down general props to the scale/pattern tracks
  const trackProps: TrackFormatterProps = {
    track,
    cell,
    isSelected,
    index,
    label,
    renameTrack,
    moveTrack,
    selectTrack,
    clearTrack,
    deleteTrack,
    duplicateTrack,
    collapseTrack,
    expandTrack,
    collapseChildren,
    expandChildren,
  };

  if (isScaleTrack(track)) {
    const typedTrack = track as ScaleTrack;
    return <ScaleTrackFormatter {...trackProps} track={typedTrack} />;
  }
  if (isPatternTrack(track)) {
    const typedTrack = track as PatternTrack;
    return <PatternTrackFormatter {...trackProps} track={typedTrack} />;
  }
  return null;
}
