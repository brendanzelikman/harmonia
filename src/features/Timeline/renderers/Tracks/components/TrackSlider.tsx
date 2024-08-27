import { InputHTMLAttributes } from "react";
import { cancelEvent } from "utils/html";
import { omit } from "lodash";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  height: number;
  icon: JSX.Element;
  showTooltip: boolean;
  tooltipTop: number;
  tooltipClassName: string;
  tooltipContent: string;
}
export const TrackSlider = (props: SliderProps) => {
  const { height, icon } = props;

  const padding = 50;
  const width = height - padding;
  const marginTop = 0.5 * width - 10;
  const transform = `rotate(270deg) translate(30px,0)`;

  const inputProps = omit(props, [
    "height",
    "icon",
    "showTooltip",
    "tooltipTop",
    "tooltipClassName",
    "tooltipContent",
  ]);
  return (
    <>
      <div className="flex w-8 flex-col items-center text-slate-300">
        {icon && <span className="text-sm mb-8">{icon}</span>}
        <input
          {...inputProps}
          style={{
            width,
            marginTop,
            transform,
          }}
          type="range"
          onDoubleClick={(e) => {
            props.onDoubleClick?.(e);
            cancelEvent(e);
          }}
        />
      </div>
      {props.showTooltip && (
        <div
          style={{ top: props.tooltipTop }}
          className={`${
            props.tooltipClassName ?? ""
          } absolute left-7 w-16 h-5 flex font-semibold items-center justify-center backdrop-blur border border-slate-300 rounded text-xs`}
        >
          {props.tooltipContent}
        </div>
      )}
    </>
  );
};
