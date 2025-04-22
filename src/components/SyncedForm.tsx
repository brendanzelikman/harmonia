import { clamp } from "lodash";
import { ComponentProps, useEffect, useState } from "react";

interface SyncedNumericalFormProps extends ComponentProps<"input"> {
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  defaultNumber?: number;
}

export const SyncedNumericalForm = (props: SyncedNumericalFormProps) => {
  const { min, max, value, setValue, defaultNumber, ...rest } = props;
  const [inputValue, setInputValue] = useState(value?.toString?.());

  useEffect(() => {
    if (parseFloat(inputValue) !== value) setInputValue(value?.toString?.());
  }, [value]);

  const commit = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      if (defaultNumber) setValue(defaultNumber);
      setInputValue((defaultNumber ?? value)?.toString?.());
      return;
    }
    const clamped = clamp(num, min, max);
    setValue(clamped);
    setInputValue(clamped.toString());
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
};
