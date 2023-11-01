import { useDrag, useDrop } from "react-dnd";
import { CustomPatternProps } from "../components/PatternEditorSidebar";

export const usePatternDrag = (props: CustomPatternProps) => {
  return useDrag({
    type: "pattern",
    item: () => {
      return { id: props.pattern?.id, index: props.index };
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
        id: props.pattern?.id,
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any) {
      if (!props.pattern || !props.element) return;
      const dragId = item.id;
      const hoverId = props.pattern?.id;
      if (dragId === hoverId) return;
      props.movePattern(dragId, hoverId);
    },
  });
};
