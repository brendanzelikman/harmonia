import { Listbox } from "@headlessui/react";
import { BsCheck, BsMusicNoteBeamed, BsSoundwave } from "react-icons/bs";
import {
  InstrumentKey,
  getInstrumentName,
  INSTRUMENT_KEYS,
} from "types/Instrument";
import { DurationType, DURATION_TYPES, DURATION_NAMES } from "utils/durations";

export interface EditorListboxProps<T> {
  value: T | undefined;
  setValue: (value: T) => void;
  onChange?: (value: T) => void;
  options: T[];
  getOptionKey?: (value: T) => any;
  getOptionValue?: (value: T) => any;
  getOptionName?: (value: T) => string;
  placeholder?: string;
  icon?: any;
  className?: string;
  borderColor?: string | undefined;
  backgroundColor?: string | undefined;
  disabled?: boolean;
}

export const EditorListbox = <T extends any>(props: EditorListboxProps<T>) => {
  if (!props.options) return null;
  const getOptionKey = props.getOptionKey ?? ((value: T) => value);
  const getOptionValue = props.getOptionValue ?? ((value: T) => value);
  const getOptionName = props.getOptionName ?? ((value: T) => value);

  const name = !!props.value ? getOptionName(props.value) : undefined;
  const defaultValue = props.options[0];
  const value = props.value ?? defaultValue;

  return (
    <Listbox value={value} onChange={props.onChange} disabled={props.disabled}>
      {({ open }) => (
        <div
          className={`relative z-40 focus-within:z-50 flex flex-col justify-center ${
            props.className ?? ""
          }`}
        >
          <Listbox.Button
            className={`text-xs z-40 flex text-ellipsis whitespace-nowrap rounded border px-2 p-1 ${
              props.disabled
                ? "text-slate-400 cursor-default"
                : open
                ? "text-slate-400"
                : "text-white"
            } ${props.borderColor ?? "border-slate-500"} ${
              props.backgroundColor ?? "bg-transparent"
            } peer font-light focus:outline-none`}
          >
            <span className="flex items-center rounded text-left w-30 text-ellipsis capitalize">
              {props.icon}
              {name || props.placeholder || "Change Value"}
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute peer animate-in fade-in zoom-in-95 duration-150 z-50 w-40 py-1 mt-1 overflow-auto text-xs bg-slate-800 border border-slate-500 backdrop-blur rounded-md shadow-lg max-h-60 capitalize focus:outline-none">
            {props.options.map((option) => {
              const optionKey = getOptionKey(option);
              const optionValue = getOptionValue(option);
              const optionName = getOptionName(option);
              return (
                <Listbox.Option
                  key={optionKey}
                  value={optionValue}
                  className={({ active }) =>
                    `group cursor-pointer select-none relative py-2 pl-6 pr-4 ${
                      active
                        ? "text-emerald-900 bg-emerald-500"
                        : "text-gray-200"
                    }`
                  }
                  onClick={() => props.setValue(option)}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`${
                          selected ? "font-medium" : "font-normal"
                        } block truncate`}
                      >
                        {`${optionName}`}
                      </span>
                      {selected ? (
                        <span
                          className={`text-emerald-600 group-hover:text-emerald-800 absolute inset-y-0 left-0 flex items-center pl-2`}
                        >
                          <BsCheck />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );
};

export const DurationListbox = (
  props: Pick<
    EditorListboxProps<DurationType>,
    "value" | "setValue" | "className" | "borderColor"
  >
) => {
  const options = DURATION_TYPES;
  const value = props.value ?? options[0];
  return (
    <EditorListbox
      value={value}
      setValue={props.setValue}
      getOptionName={(d) => DURATION_NAMES[d]}
      icon={<BsMusicNoteBeamed className="mr-2" />}
      options={options}
      placeholder="Change Duration"
      borderColor={props.borderColor}
      className={props.className}
    />
  );
};

export const InstrumentListbox = (props: {
  value: InstrumentKey;
  setValue: (instrument: InstrumentKey) => void;
}) => {
  return (
    <EditorListbox
      value={props.value}
      setValue={props.setValue}
      getOptionName={getInstrumentName}
      icon={<BsSoundwave className="mr-2" />}
      options={INSTRUMENT_KEYS}
      placeholder="Change Instrument"
    />
  );
};
