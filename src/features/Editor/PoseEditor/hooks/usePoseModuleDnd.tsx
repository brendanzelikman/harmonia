import { useDrag, useDrop } from "react-dnd";
import { movePoseBlock } from "redux/Pose";
import { useProjectDispatch } from "redux/hooks";
import { PoseId } from "types/Pose";

interface PoseModuleDragProps {
  id: PoseId;
  index: number;
}

export const usePoseModuleDrag = (props: PoseModuleDragProps) => {
  return useDrag({
    type: "module",
    item: props,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const usePoseModuleDrop = (props: PoseModuleDragProps) => {
  const dispatch = useProjectDispatch();
  return useDrop({
    accept: "module",
    collect(monitor) {
      return {
        ...props,
        isOver: monitor.isOver(),
        handlerId: monitor.getHandlerId(),
      };
    },
    drop(item: any) {
      const id = item.id;
      const oldIndex = item.index;
      const newIndex = props.index;
      if (oldIndex === newIndex) return;
      dispatch(movePoseBlock({ id, oldIndex, newIndex }));
    },
  });
};
