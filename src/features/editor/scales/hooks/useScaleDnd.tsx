import { useDrag, useDrop } from "react-dnd";
import { CustomScaleProps } from "../components";

export const useScaleDrag = (props: CustomScaleProps) => {
  return useDrag({
    type: "scale",
    item: () => {
      return { id: props.customScale.id, index: props.index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const useScaleDrop = (props: CustomScaleProps) => {
  return useDrop({
    accept: "scale",
    collect(monitor) {
      return {
        id: props.customScale.id,
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor: any) {
      if (!props.element) return;
      const dragId = item.id;
      const hoverId = props.customScale.id;

      // Don't replace items with themselves
      if (dragId === hoverId) return;

      // Time to actually perform the action
      props.moveScale(dragId, hoverId);
    },
  });
};
