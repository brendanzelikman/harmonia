import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import {
  setEditorClockLength,
  setEditorClockTickDuration,
} from "types/Editor/EditorSlice";
import { useProjectDispatch } from "types/hooks";
import { sanitize } from "utils/math";
import { defaultEditorClockSettings } from "types/Editor/EditorTypes";
import { DurationListbox } from "features/Editor/components/EditorListbox";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { PatternEditorProps } from "../PatternEditor";

export function PatternEditorClockTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const holding = useHeldHotkeys("shift");
  return (
    <EditorTab show={props.isCustom} border={false}>
      <EditorTabGroup border>
        <span>Clock Length:</span>
        <input
          type="number"
          min={1}
          max={64}
          className={`rounded-md text-xs w-12 text-center bg-slate-800 text-neutral-100`}
          value={
            props.settings.clock?.clockLength ?? defaultEditorClockSettings
          }
          onChange={(e) => {
            const value = sanitize(e.target.valueAsNumber) || 16;
            if (value < 1 || value > 64) return;
            dispatch(setEditorClockLength(value));
          }}
        />
      </EditorTabGroup>
      <EditorTabGroup border>
        <span>Beat Duration:</span>
        <DurationListbox
          value={props.settings.clock?.tickDuration}
          setValue={(value) => dispatch(setEditorClockTickDuration(value))}
        />
      </EditorTabGroup>
      <EditorTabGroup>
        <span className={holding.shift ? "text-emerald-400" : ""}>
          Hold Shift to Preview
        </span>
      </EditorTabGroup>
    </EditorTab>
  );
}
