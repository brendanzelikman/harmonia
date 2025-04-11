import classNames from "classnames";
import { blurOnEnter, cancelEvent } from "utils/event";

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  hideValue?: boolean;
  horizontal?: boolean;
  width?: string;
  className?: string;
  disabled?: boolean;
  onDoubleClick?: () => void;
}

export function Slider(props: SliderProps) {
  const value = props.value ?? props.defaultValue ?? 0;
  return (
    <div
      className={classNames(
        props.className,
        "w-full flex flex-col items-center justify-center hover:cursor-pointer active:cursor-grab"
      )}
      onDoubleClick={() => props.onValueChange(props.defaultValue)}
    >
      <input
        className={classNames(
          !!props.horizontal ? props.width ?? "w-32" : "w-16 rotate-[270deg]",
          `mt-4 mb-6 text-center`
        )}
        type="range"
        value={value}
        onKeyDown={blurOnEnter}
        onChange={(e) => {
          if (props.disabled) return;
          cancelEvent(e);
          props.onValueChange(e.target.valueAsNumber);
        }}
        onDoubleClick={(e) => {
          if (props.disabled) return;
          cancelEvent(e);
          if (props.onDoubleClick) props.onDoubleClick();
          else props.onValueChange(props.defaultValue);
        }}
        draggable
        onDragStart={cancelEvent}
        step={props.step}
        min={props.min}
        max={props.max}
      />
      <label className="text-xs mt-2 font-bold text-slate-400">
        {props.label}
      </label>
      {!props.hideValue && (
        <label className="text-xs font-light text-white">{value}</label>
      )}
    </div>
  );
}
