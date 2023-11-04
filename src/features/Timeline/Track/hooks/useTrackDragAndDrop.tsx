import { useDrag, useDrop } from "react-dnd";
import { Track, TrackId } from "types/Track";

export interface DraggableTrackProps {
  track: Track;
  index: number;
  element?: any;
  moveTrack: (dragId: TrackId, hoverId: TrackId) => void;
}
export const useTrackDrag = (props: DraggableTrackProps) => {
  return useDrag({
    type: "track",
    item: () => {
      return { id: props.track.id, type: props.track.type };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const useTrackDrop = (props: DraggableTrackProps) => {
  return useDrop({
    accept: "track",
    collect(monitor) {
      return { id: props.track.id, handlerId: monitor.getHandlerId() };
    },
    drop(item: any) {
      if (!props.element) return;
      const dragId = item.id;
      const hoverId = props.track.id;
      if (dragId === hoverId) return;
      props.moveTrack(dragId, hoverId);
    },
  });
};
