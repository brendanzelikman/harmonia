import { useToggle } from "hooks/useToggle";
import { useRef, useEffect } from "react";
import { useDragLayer, useDrag, DragSourceMonitor } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { GiCompactDisc } from "react-icons/gi";
import { dispatchCustomEvent } from "utils/html";

export const ProjectDisc = (props: {
  projectId: string;
  isDemo: boolean;
  className?: string;
  deleting?: boolean;
  onClick?: () => void;
}) => {
  const state = useToggle(props.projectId);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "project",
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: { id: props.projectId },
    }),
    []
  );
  useEffect(() => {
    if (state.isOpen && !isDragging) {
      state.close();
      dispatchCustomEvent("dragged-project", false);
    } else if (!state.isOpen && isDragging) {
      state.open();
      dispatchCustomEvent("dragged-project", props.projectId);
    }
  }, [state, isDragging]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  if (props.isDemo) {
    return (
      <GiCompactDisc onClick={props.onClick} className={props.className} />
    );
  }
  return (
    <div
      data-deleting={props.deleting}
      onClick={props.onClick}
      className={props.className}
      style={{ opacity: isDragging ? 0 : 1 }}
      ref={drag}
    >
      <GiCompactDisc className="size-full rounded-full" />
    </div>
  );
};

export const ProjectDiscPreview = () => {
  const prev = useRef({ x: 0, y: 0 });
  const { isDragging, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
    })
  );
  useEffect(() => {
    const { x, y } = currentOffset || { x: 0, y: 0 };
    if (!initialOffset) return;
    const dx = (x - initialOffset.x) * 0.1;
    const dy = (y - initialOffset.y) * 0.1;
    prev.current = { x: dx, y: dy };
  }, [currentOffset, initialOffset]);

  if (!isDragging || !currentOffset || !initialOffset) return null;
  let { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y - 25}px) rotateX(75deg)`;
  return (
    <GiCompactDisc
      className="size-72 top-0 left-0 rotate-disc fixed select-none pointer-events-none z-50"
      style={{ transform }}
    />
  );
};
