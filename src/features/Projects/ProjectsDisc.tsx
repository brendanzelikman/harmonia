import { useToggle } from "hooks/useToggle";
import { useEffect } from "react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { GiCompactDisc } from "react-icons/gi";
import { dispatchCustomEvent } from "utils/event";

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
      ref={drag}
    >
      <GiCompactDisc className="size-full rounded-full" />
    </div>
  );
};
