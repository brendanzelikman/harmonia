import { useNumericInputs } from "hooks";
import { useEffect } from "react";
import { PatternEditorProps } from "../PatternEditor";
import { EditorListbox } from "features/Editor/components/EditorListbox";
import { EditorNumericField } from "features/Editor/components/EditorField";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { useProjectDispatch } from "types/hooks";
import {
  editPatternChordStrum,
  togglePatternChordStrum,
} from "types/Pattern/PatternFunctions";
import { updatePatternBlock } from "types/Pattern/PatternSlice";
import {
  isPatternStrummedChord,
  isPatternBlockedChord,
} from "types/Pattern/PatternTypes";

export function PatternEditorChordTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { id, cursor, index, block } = props;
  const isValid = !!id && index !== undefined;

  /** Toggle the chord strum between "off", "up", and "down" */
  const ChordStrumDirection = () => {
    type StrumDirection = "off" | "up" | "down";
    const options: StrumDirection[] = ["off", "up", "down"];

    // Get the current value from the block
    const value = isPatternStrummedChord(block) ? block.strumDirection : "off";

    // Set the value based on the current block
    const setValue = (value: StrumDirection) => {
      if (!isValid) return;
      // If the chord is off, remove the strum or do nothing
      if (value === "off") {
        if (isPatternStrummedChord(block)) {
          const newBlock = [...block.chord];
          dispatch(updatePatternBlock({ id, index, block: newBlock }));
        }
      } else {
        // If the chord is strummed, update the strum direction
        if (isPatternStrummedChord(block)) {
          const newBlock = editPatternChordStrum(block, {
            strumDirection: value,
          });
          dispatch(updatePatternBlock({ id, index, block: newBlock }));
        }
        // If the chord is blocked, toggle the strum and update
        else if (isPatternBlockedChord(block)) {
          const newBlock = editPatternChordStrum(
            togglePatternChordStrum(block),
            { strumDirection: value }
          );
          dispatch(updatePatternBlock({ id, index, block: newBlock }));
        }
      }
    };
    return (
      <div className="h-5 flex text-xs items-center">
        <EditorListbox
          value={value}
          options={options}
          getOptionName={(option) => `Strum = ${option}`}
          setValue={setValue}
        />
      </div>
    );
  };

  /** Adjust the range of the chord strum if it is enabled. */
  const StrumRangeInputs = useNumericInputs([
    {
      id: "strumRange-0",
      initialValue: 0,
      min: 0,
      callback: (value) => {
        if (!isValid) return;
        if (!isPatternStrummedChord(block)) return;
        const newBlock = editPatternChordStrum(block, {
          strumRange: [value ?? 0, block.strumRange[1]],
        });
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
      },
    },
    {
      id: "strumRange-1",
      initialValue: 0,
      min: 0,
      callback: (value) => {
        if (!isValid) return;
        if (!isPatternStrummedChord(block)) return;
        const newBlock = editPatternChordStrum(block, {
          strumRange: [block.strumRange[0], value ?? 0],
        });
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
      },
    },
  ]);
  const ChordStrumRange = () => {
    if (!isPatternStrummedChord(block)) return null;
    return (
      <>
        <EditorNumericField
          className="w-20 bg-transparent border-slate-500  focus:border-teal-500/80"
          value={StrumRangeInputs.getValue("strumRange-0")}
          onChange={StrumRangeInputs.onChange("strumRange-0")}
          min={0}
          leadingText="Before = "
        />
        <EditorNumericField
          className="w-20 bg-transparent border-slate-500  focus:border-teal-500/80"
          value={StrumRangeInputs.getValue("strumRange-1")}
          onChange={StrumRangeInputs.onChange("strumRange-1")}
          min={0}
          leadingText="After = "
        />
      </>
    );
  };
  /** Set the strum range when the chord changes. */
  useEffect(() => {
    if (!isPatternStrummedChord(block)) return;
    const range = block.strumRange;
    StrumRangeInputs.setValue("strumRange-0", range[0].toString());
    StrumRangeInputs.setValue("strumRange-1", range[1].toString());
  }, [block]);

  return (
    <EditorTab show={props.isCustom && !cursor.hidden} border={false}>
      <EditorTabGroup>
        <ChordStrumDirection />
        {ChordStrumRange()}
      </EditorTabGroup>
    </EditorTab>
  );
}
