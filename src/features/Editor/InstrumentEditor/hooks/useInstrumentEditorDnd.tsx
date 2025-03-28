import { useDrag, useDrop } from "react-dnd";
import { DraggableEffectProps } from "../components/InstrumentEditorEffects";

export const useEffectDrag = (props: DraggableEffectProps) => {
  return useDrag({
    type: "effect",
    item: () => ({ id: props.effect.id, index: props.index }),
    collect: (monitor: any) => ({ isDragging: monitor.isDragging() }),
  });
};

export const useEffectDrop = (props: DraggableEffectProps) => {
  return useDrop({
    accept: "effect",
    collect() {
      return { id: props.effect.id, index: props.index };
    },
    drop(item: any) {
      if (!props.element) return;
      const { index: dragIndex, id: dragId } = item;
      const hoverIndex = props.index;
      if (dragIndex === hoverIndex) return;
      props.moveEffect(dragId, hoverIndex);
    },
  });
};
