import { Listbox, Transition } from "@headlessui/react";
import { BsCheck } from "react-icons/bs";

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
}

export const EditorListbox = <T extends any>(props: EditorListboxProps<T>) => {
  if (!props.options) return null;
  const getOptionKey = props.getOptionKey ?? ((value: T) => value);
  const getOptionValue = props.getOptionValue ?? ((value: T) => value);
  const getOptionName = props.getOptionName ?? ((value: T) => value);

  const name = props.value ? getOptionName(props.value) : undefined;
  const defaultValue = props.options[0];
  const value = props.value ?? defaultValue;

  return (
    <Listbox value={value} onChange={props.onChange}>
      {({ open }) => (
        <div
          className={`relative z-40 focus-within:z-50 flex flex-col justify-center ${
            props.className ?? ""
          }`}
        >
          <Listbox.Button
            className={`text-xs z-40 flex text-ellipsis whitespace-nowrap rounded border-[1.5px] px-2 p-1 ${
              open ? "text-slate-400" : "text-slate-300"
            } ${props.borderColor ?? "border-slate-500/50"} ${
              props.backgroundColor ?? "bg-slate-800/50"
            } peer font-light focus:outline-none`}
          >
            <span className="flex items-center rounded text-left cursor-pointer w-30 text-ellipsis capitalize">
              {props.icon}
              {name || props.placeholder || "Change Value"}
            </span>
          </Listbox.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            className="peer"
          >
            <Listbox.Options className="absolute z-50 w-40 py-1 mt-1 overflow-auto text-xs bg-slate-800 border border-slate-500 backdrop-blur rounded-md shadow-lg max-h-60 capitalize focus:outline-none">
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
          </Transition>
        </div>
      )}
    </Listbox>
  );
};
