import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

export default function useDebouncedField<T>(
  update: (value: any) => void,
  initialValue?: T
) {
  const [value, setValue] = useState<T | undefined>(initialValue);

  const _updateValue = (value: any) => {
    update(value);
  };
  const updateValue = useCallback(
    debounce(_updateValue, 250, { leading: false, trailing: true }),
    []
  );
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") setValue(undefined);
    else setValue(e.target.value as T);
    updateValue(e.target.value);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateValue.flush();
      e.currentTarget.blur();
    }
  };

  return { value, setValue, onChange, onKeyDown };
}
