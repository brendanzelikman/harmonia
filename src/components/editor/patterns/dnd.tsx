import { useDrag, useDrop } from "react-dnd";
import { CustomPatternProps } from "./PatternItem";

export const usePatternDrag = (props: CustomPatternProps) => {
  return useDrag({
    type: "pattern",
    item: () => {
      return { id: props.pattern.id, index: props.index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const usePatternDrop = (props: CustomPatternProps) => {
  return useDrop({
    accept: "pattern",
    collect(monitor) {
      return {
        id: props.pattern.id,
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor: any) {
      if (!props.element) return;
      const dragId = item.id;
      const hoverId = props.pattern.id;

      // Don't replace items with themselves
      if (dragId === hoverId) return;

      // Time to actually perform the action
      props.movePattern(dragId, hoverId);
    },
  });
};
