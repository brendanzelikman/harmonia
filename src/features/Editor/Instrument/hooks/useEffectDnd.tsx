import { useDrag, useDrop } from "react-dnd";
import { DraggableEffectProps } from "../components";

export const useEffectDrag = (props: DraggableEffectProps) => {
  return useDrag({
    type: "effect",
    item: () => {
      return { id: props.effect.id, index: props.index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const useEffectDrop = (props: DraggableEffectProps) => {
  return useDrop({
    accept: "effect",
    collect(monitor) {
      return {
        id: props.effect.id,
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    drop(item: any, monitor: any) {
      if (!props.element) return;
      const dragIndex = item.index;
      const dragId = item.id;
      const hoverIndex = props.index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Time to actually perform the action
      props.moveEffect(dragId, hoverIndex);
    },
  });
};
