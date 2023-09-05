// @ts-ignore
import { Knob } from "react-rotary-knob";
import skin from "./KnobSkin";

export interface InstrumentKnobProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
}

export function InstrumentKnob(props: InstrumentKnobProps) {
  // Create an onChange handler that prevents the knob going from max to min
  const onChange = (value: number) => {
    const maxDistance = Math.abs(props.max - props.min) / 5;
    const distance = Math.abs(props.value - value);
    if (distance > maxDistance) return;
    props.onValueChange(value);
  };
  // Return the knob
  return (
    <div
      className="flex flex-col items-center justify-center hover:cursor-pointer active:cursor-grab"
      onDoubleClick={() => props.onValueChange(props.defaultValue)}
    >
      <Knob
        skin={skin(-Math.log10(props.step))}
        step={props.step}
        preciseMode={false}
        unlockDistance={0}
        min={props.min}
        max={props.max}
        defaultValue={props.defaultValue}
        value={props.value}
        onChange={onChange}
      />
      <label className="text-xs mt-2">{props.label}</label>
    </div>
  );
}
