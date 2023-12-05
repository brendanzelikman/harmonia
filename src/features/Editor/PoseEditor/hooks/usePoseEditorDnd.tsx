import { useDrag, useDrop } from "react-dnd";
import { CustomPoseProps } from "../components/PoseEditorSidebar";

export const usePoseDrag = (props: CustomPoseProps) => {
  return useDrag({
    type: "pose",
    item: () => {
      return { id: props.pose?.id, index: props.index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const usePoseDrop = (props: CustomPoseProps) => {
  return useDrop({
    accept: "pose",
    collect(monitor) {
      return {
        id: props.pose?.id,
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any) {
      if (!props.pose || !props.element) return;
      const dragId = item.id;
      const hoverId = props.pose?.id;
      if (dragId === hoverId) return;
      props.movePose(dragId, hoverId);
    },
  });
};
