import classNames from "classnames";
import { PoseEditorVectorProps } from "./PoseEditorVector";
import { Editor } from "features/Editor/components";
import { Listbox } from "@headlessui/react";
import {
  NumericInputOption,
  useNumericInputs,
} from "hooks/window/useNumericInputs";
import { useEffect } from "react";
import {
  PoseVectorId,
  getPoseVectorOffsetName,
  mapPoseVector,
} from "types/Pose";
import { getValueByKey } from "utils/objects";
import { useProjectSelector } from "redux/hooks";
import { selectTrackMap } from "redux/Track";

interface PoseEditorOffsetMenuProps extends PoseEditorVectorProps {
  vectorId: PoseVectorId;
  setVectorId: (id: PoseVectorId) => void;
}

export function PoseEditorOffsetMenu(props: PoseEditorOffsetMenuProps) {
  const { updateBlock, module, vectorId, setVectorId, vectorKeys } = props;
  const vector = module.vector;
  const trackMap = useProjectSelector(selectTrackMap);

  // Create an input for a vector offset
  const createOffsetOption = (id: PoseVectorId): NumericInputOption => ({
    id,
    initialValue: vector[id] ?? 0,
    initialSymbol: "0",
    callback: (value) =>
      updateBlock({ ...module, vector: { ...vector, [id]: value ?? 0 } }),
  });

  // Numeric inputs for each vector offset
  const offsetOptions = vectorKeys.map(createOffsetOption);
  const offsetOption = offsetOptions.find((option) => option.id === vectorId);

  // Use a hook to handle the offset options
  const Input = useNumericInputs([...offsetOptions]);
  useEffect(() => {
    Object.keys(vector).forEach((offsetId) => {
      const value = vector[offsetId];
      const valueString = !value ? "0" : value.toString();
      const currentOffset = Input.getValue(offsetId);
      if (currentOffset === "") {
        Input.setValue(offsetId, "0");
      } else if (currentOffset !== valueString) {
        Input.setValue(offsetId, valueString);
      }
    });
  }, [vector]);

  // The user can select a vector ID from a listbox
  const OffsetListbox = () => (
    <Listbox onChange={setVectorId}>
      {({ open }) => (
        <div className="w-28 relative">
          <Listbox.Button className="h-8 text-center bg-pink-500 border border-slate-200 w-full rounded select-none">
            Select Offset
          </Listbox.Button>
          {!!open && (
            <Listbox.Options
              className={classNames(
                "w-full absolute top-9 flex flex-col gap-1 py-0.5",
                "border border-slate-200 rounded-md ring-opacity-5 focus:outline-none",
                "bg-pink-400/80 backdrop-blur shadow-lg animate-in fade-in"
              )}
            >
              {vectorKeys.map((key) => (
                <Listbox.Option
                  key={key}
                  value={key}
                  className="hover:bg-pink-500 w-full px-2 py-1 cursor-pointer"
                >
                  {getPoseVectorOffsetName(key, trackMap)}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </div>
      )}
    </Listbox>
  );

  const OffsetNumericField = () => {
    if (!offsetOption) return null;
    const offsetName = getPoseVectorOffsetName(offsetOption.id, trackMap);
    return (
      <Editor.NumericField
        key={offsetOption.id}
        className={classNames(
          "h-8 w-36 focus:bg-pink-400/80 focus:border-pink-100",
          Input.getValue(offsetOption.id) !== "0"
            ? "bg-pose/70"
            : "bg-transparent"
        )}
        leadingText={`${offsetName} = `}
        placeholder="0"
        value={Input.getValue(offsetOption.id) || ""}
        onChange={Input.onChange(offsetOption.id)}
      />
    );
  };

  // The clear offset button clears the given offset by ID
  const ClearOffsetButton = ({ id }: { id?: string }) => (
    <button
      className={classNames(
        `w-16 h-8 text-center border rounded font-extralight transition-all duration-300`,
        !!getValueByKey(vector, id)
          ? "bg-pink-500 border-slate-200"
          : "bg-transparent border-slate-500 opacity-50 cursor-default"
      )}
      onClick={() => {
        const newVector = mapPoseVector(vector, (k, v) => (k === id ? 0 : v));
        updateBlock({ ...module, vector: newVector });
      }}
    >
      Clear
    </button>
  );

  return (
    <div className="container-row gap-2 animate-in fade-in ring-1 ring-pink-500/50 rounded">
      {OffsetListbox()}
      {OffsetNumericField()}
      <ClearOffsetButton id={offsetOption?.id} />
    </div>
  );
}
