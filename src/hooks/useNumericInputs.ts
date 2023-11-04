import { clamp } from "lodash";
import { useState } from "react";

type NumericInputMap = Record<string, string>;
export type NumericInputCallback = (number: number | undefined) => void;

export interface NumericInputOptions {
  id: string;
  initialValue?: number;
  callback: NumericInputCallback;
  min?: number;
  max?: number;
}

export function useNumericInputs(options: NumericInputOptions[]) {
  const [inputs, setInputs] = useState<NumericInputMap>(mapProps(options));

  const getValue = (id: string) => {
    return inputs[id] ?? "0";
  };
  const setValue = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const onChange = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = options.find((p) => p.id === id);
    if (!input) return;
    const currentValue = getValue(id);

    // Parse the input value and check if it is negative
    let match = e.target.value.match(/(?:=|^)\s*(-?\d+(?:-\w+)?)/)?.[1];

    // Check for negative values and get the sign
    const matchCount = [...e.target.value].filter((_) => _ === "-").length;
    const matchSign = Math.pow(-1, matchCount);
    const isCurrentValueNegative = currentValue.includes("-");
    const currentValueSign = isCurrentValueNegative ? -1 : 1;
    const sign = matchSign * currentValueSign;

    let value = parseInt(match ?? "") * sign;

    // Clamp the value
    value = clamp(value, input.min ?? -Infinity, input.max ?? Infinity);

    // Set the value using the string
    let string = isNaN(value) ? `${sign < 0 ? "-" : ""}0` : value.toString();

    if ((!string.length || string === "0") && sign < 0) string = "-";
    else if (currentValue === "0" && string === "") string = "0";

    setValue(input.id, string);

    // Fire the callback with the number
    const number = isNaN(value) ? undefined : value;
    input.callback(number);
  };

  return { getValue, setValue, onChange };
}

function mapProps(props: NumericInputOptions[]) {
  return props.reduce(
    (acc, cur) => ({ ...acc, [cur.id]: (cur.initialValue || 0).toString() }),
    {}
  );
}
