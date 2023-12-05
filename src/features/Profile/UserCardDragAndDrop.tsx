import { useDrag, useDrop } from "react-dnd";

interface UserCardDndProps {
  id: string;
  type: string;
  moveCard: (dragId: string, hoverId: string) => void;
}

export const useUserCardDrag = (props: UserCardDndProps) => {
  return useDrag({
    type: `topic-${props.type}`,
    item: props,
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
};

export const useUserCardDrop = (props: UserCardDndProps) => {
  return useDrop({
    accept: `topic-${props.type}`,
    collect(monitor) {
      return { ...props, handlerId: monitor.getHandlerId() };
    },
    hover(item: any) {
      const hoverId = item.id;
      const dragId = props.id;
      if (dragId === hoverId) return;
      props.moveCard(dragId, hoverId);
    },
  });
};
