import classNames from "classnames";
import { PoseEditorVectorProps } from "./PoseEditorVector";
import { Listbox } from "@headlessui/react";
import {
  NumericInputOption,
  useNumericInputs,
} from "hooks/window/useNumericInputs";
import { useEffect } from "react";
import { isUndefined } from "lodash";
import { EditorNumericField } from "features/Editor/components/EditorField";

interface PoseEditorDurationMenuProps extends PoseEditorVectorProps {}

export function PoseEditorDurationMenu(props: PoseEditorDurationMenuProps) {
  const { updateBlock, module, vectors } = props;
  const { repeat, duration } = module;

  // Numeric input for duration
  const durationOption: NumericInputOption = {
    id: "duration",
    initialValue: duration,
    initialSymbol: "∞",
    min: 0,
    callback: (duration) =>
      updateBlock({
        ...module,
        duration: isUndefined(duration) ? duration : Math.abs(duration),
      }),
  };

  // Numeric input for repeat
  const repeatOption: NumericInputOption = {
    id: "repeat",
    initialValue: module.repeat ?? 1,
    initialSymbol: "1",
    min: 0,
    callback: (repeat) =>
      updateBlock({
        ...module,
        repeat: isUndefined(repeat) ? repeat : Math.abs(repeat),
      }),
  };

  // Use a hook to handle duration and repeat values
  const Input = useNumericInputs([durationOption, repeatOption]);

  // Get the current duration value
  const durationInputValue = Input.getValue("duration");
  const durationValue = durationInputValue === "" ? "∞" : durationInputValue;

  useEffect(() => {
    const durationString = duration === undefined ? "" : duration.toString();
    const currentDuration = Input.getValue("duration");
    if (currentDuration === "") {
      Input.setValue("duration", "");
    } else if (currentDuration !== durationString) {
      Input.setValue("duration", durationString);
    }
  }, [duration]);

  // Get the current repeat value
  const repeatInputValue = Input.getValue("repeat");
  const repeatValue = repeatInputValue === "" ? "1" : repeatInputValue;
  useEffect(() => {
    const repeatString = repeat === undefined ? "" : repeat.toString();
    const currentRepeat = Input.getValue("repeat");
    if (currentRepeat === "") {
      Input.setValue("repeat", "");
    } else if (currentRepeat !== repeatString) {
      Input.setValue("repeat", repeatString);
    }
  }, [duration, repeat]);

  return (
    <div className="size-full flex total-center gap-2 animate-in fade-in ring-1 ring-pink-500/50 rounded">
      <EditorNumericField
        className={classNames(
          "w-24 h-8 focus:border-pink-100",
          !duration ? "bg-transparent" : "bg-pose/80"
        )}
        leadingText="Ticks = "
        placeholder="∞"
        value={durationValue}
        onChange={Input.onChange("duration")}
      />
      <EditorNumericField
        className={classNames(
          "w-24 h-8 focus:border-pink-100",
          !repeat ? "bg-transparent" : "bg-pose/80"
        )}
        leadingText="Repeat = "
        placeholder="1"
        value={repeatValue}
        onChange={Input.onChange("repeat")}
      />
      <Listbox
        onChange={(value: number) =>
          updateBlock({ ...module, chain: vectors[value]?.vector })
        }
      >
        {({ open }) => (
          <div className="w-32 relative">
            <Listbox.Button className="h-8 text-center bg-pink-500 border border-slate-200 w-full rounded">
              Chain on Repeat
            </Listbox.Button>
            {!!open && (
              <Listbox.Options
                className={classNames(
                  "w-full absolute top-9 flex flex-col gap-1 py-0.5",
                  "border border-slate-200 rounded-md ring-opacity-5 focus:outline-none",
                  "bg-pink-400/80 shadow-lg"
                )}
              >
                {["delete", ...vectors].map((val, index) => (
                  <Listbox.Option
                    key={`chainable-vector-${index}`}
                    value={index - 1}
                    className="hover:bg-pink-500 w-full px-2 py-1 cursor-pointer"
                  >
                    {val === "delete" ? "Delete Chain" : `Vector ${index}`}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}
