import { useDrag, useDrop } from "react-dnd";
import { useProjectDispatch } from "types/hooks";
import { dragTrack } from "types/Track/TrackThunks";
import { TrackId } from "types/Track/TrackTypes";

export const useTrackDrag = (id: TrackId) => {
  return useDrag({
    type: "track",
    item: () => ({ id }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const useTrackDrop = (id: TrackId) => {
  const dispatch = useProjectDispatch();
  return useDrop({
    accept: "track",
    collect(monitor) {
      return { id, handlerId: monitor.getHandlerId() };
    },
    drop(item: any) {
      const dragId = item.id;
      const hoverId = id;
      if (dragId === hoverId) return;
      dispatch(dragTrack(dragId, hoverId));
    },
  });
};

export const useTrackDragAndDrop = (id: TrackId) => {
  const [{ isDragging }, drag] = useTrackDrag(id);
  const [_, drop] = useTrackDrop(id);
  return { isDragging, drag, drop };
};
