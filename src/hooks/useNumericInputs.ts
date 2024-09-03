import { clamp } from "lodash";
import { useState } from "react";

type NumericInputMap = Record<string, string>;
export type NumericInputCallback = (number: number | undefined) => void;

export interface NumericInputOption {
  id: string;
  initialValue?: number;
  initialSymbol?: string;
  callback: NumericInputCallback;
  min?: number;
  max?: number;
}

export function useNumericInputs(options: NumericInputOption[]) {
  const [inputs, setInputs] = useState<NumericInputMap>(mapProps(options));

  const getValue = (id: string) => {
    return inputs[id] || "";
  };
  const setValue = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value ?? "" }));
  };

  const onChange = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = options.find((p) => p.id === id);
    if (!input) return;
    const currentValue = getValue(id);
    const symbol = input.initialSymbol ?? "0";

    // Extract the last string of numbers using a regex
    // Checks for space, negative sign, and digits
    let match = e.target.value.match(/\s-?\d+(?=\D*$)/)?.[0];

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
    let string = isNaN(value)
      ? `${sign < 0 ? "-" : ""}${symbol}`
      : value.toString();

    if ((!string.length || string === symbol) && sign < 0) string = "-";
    else if (currentValue === symbol && string === "") string = symbol;
    else if (string === symbol && currentValue !== "") string = currentValue;
    else if (string.startsWith(symbol)) string = string.replace(symbol, "");

    if (currentValue !== "") setValue(input.id, string);
    else setValue(input.id, string);

    // Fire the callback with the number
    const number = isNaN(value) ? undefined : value;
    input.callback(number);
  };

  return { getValue, setValue, onChange };
}

function mapProps(props: NumericInputOption[]) {
  return props.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.id]: cur.initialValue?.toString() ?? "",
    }),
    {}
  );
}
