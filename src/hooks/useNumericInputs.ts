import { clamp } from "lodash";
import { useEffect, useMemo, useState } from "react";

type Callback = (number: number) => void;

export interface NumericInputProps {
  id: string;
  initialValue?: number;
  callback: Callback;
  min?: number;
  max?: number;
}

export function useNumericInputs(props: NumericInputProps[]) {
  const [inputs, setInputs] = useState<Record<string, string>>(mapProps(props));

  const getValue = (id: string) => {
    return inputs[id] ?? "0";
  };
  const setValue = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const onChange = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = props.find((p) => p.id === id);
    if (!input) return;

    // Remove all numbers and sanitize the input
    let number = parseInt(e.target.value.match(/\d+(?!.*\d)/)?.[0] ?? "0");
    if (e.target.value.includes("-")) number *= -1;

    // Clamp the value to the min/max
    number = clamp(number, input.min ?? -Infinity, input.max ?? Infinity);
    const newValue = number.toString();
    setValue(input.id, newValue);

    // Fire the callback
    input.callback(number);
  };

  return { getValue, setValue, onChange };
}

function mapProps(props: NumericInputProps[]) {
  return props.reduce(
    (acc, cur) => ({ ...acc, [cur.id]: (cur.initialValue || 0).toString() }),
    {}
  );
}
