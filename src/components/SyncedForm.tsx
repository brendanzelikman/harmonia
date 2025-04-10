import { clamp } from "lodash";
import { ComponentProps, useEffect, useState } from "react";

interface SyncedNumericalFormProps extends ComponentProps<"input"> {
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
}

export const SyncedNumericalForm = (props: SyncedNumericalFormProps) => {
  const { min, max, value, setValue, ...rest } = props;
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => setInputValue(value), [value]);
  return (
    <input
      {...rest}
      type="number"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.valueAsNumber)}
      onBlur={() => {
        const newValue = clamp(inputValue, min, max);
        setInputValue(newValue);
        setValue(newValue);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const currentValue = e.currentTarget.valueAsNumber;
        e.currentTarget.blur();
        if (isNaN(currentValue)) return;
        const newValue = clamp(currentValue, min, max);
        setInputValue(newValue);
        setValue(newValue);
      }}
    />
  );
};
