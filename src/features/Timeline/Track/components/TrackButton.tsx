import { MouseEvent, ReactNode } from "react";
import { cancelEvent } from "utils/html";

export const TrackButton = (props: {
  className?: string;
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}) => {
  return (
    <button
      aria-label="Track Button"
      className={`${
        props.className ?? ""
      } flex flex-1 items-center justify-center rounded-md truncate min-w-none min-h-[25px] max-h-[30px] m-1 font-light border`}
      onClick={(e) => {
        props.onClick?.(e);
        e.currentTarget.blur();
      }}
      onDoubleClick={cancelEvent}
    >
      {props.children}
    </button>
  );
};
