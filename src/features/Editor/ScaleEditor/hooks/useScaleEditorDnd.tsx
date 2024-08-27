import { useDrag, useDrop } from "react-dnd";
import { CustomScaleProps } from "../components/ScaleEditorCustomScale";

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
        id: props.customScale.id ?? JSON.stringify(props.customScale),
        index: props.index,
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any) {
      const { id: dragId, customScale } = item;
      const hoverId = customScale.id || JSON.stringify(customScale);
      if (dragId === hoverId || !props.element) return;
      props.moveScale(dragId, hoverId);
    },
  });
};
