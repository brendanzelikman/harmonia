export interface SliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
}

export function Slider(props: SliderProps) {
  const value = props.value ?? props.defaultValue ?? 0;
  return (
    <div
      className="w-full flex flex-col items-center justify-center hover:cursor-pointer active:cursor-grab"
      onDoubleClick={() => props.onValueChange(props.defaultValue)}
    >
      <input
        className="w-16 rotate-[270deg] mt-4 mb-6 text-center"
        type="range"
        value={value}
        onChange={(e) => props.onValueChange(e.target.valueAsNumber)}
        step={props.step}
        min={props.min}
        max={props.max}
      />
      <label className="text-xs mt-2 font-bold text-slate-400">
        {props.label}
      </label>
      <label className="text-xs font-light text-white">{value}</label>
    </div>
  );
}
