import { useSubscription } from "providers/subscription";
import { EditorTooltipButton } from "components/TooltipButton";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { GiArrowDunk, GiStack } from "react-icons/gi";
import { PatternEditorInstrumentBox } from "./PatternEditorInstrumentBox";
import { PatternEditorTabs } from "./PatternEditorTabs";
import { useProjectDispatch } from "types/hooks";
import { exportPatternToMIDI } from "types/Pattern/PatternExporters";
import { copyPattern, downloadPatternAsXML } from "types/Pattern/PatternThunks";
import { PatternEditorProps } from "../PatternEditor";

export function PatternEditorToolbar(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, id, isCustom } = props;
  const subscription = useSubscription();

  /** The user can copy a pattern. */
  const CopyButton = () => (
    <EditorTooltipButton
      label="Duplicate the Pattern"
      className={`rounded-full text-xl active:bg-teal-600`}
      onClick={() => dispatch(copyPattern(pattern))}
      keepTooltipOnClick
    >
      <GiStack />
    </EditorTooltipButton>
  );

  /** The user can export a pattern to MIDI or MusicXML. */
  const ExportButton = () => {
    if (!subscription.isAtLeastStatus("maestro")) return null;
    return (
      <EditorTooltipButton
        label="Export The Pattern"
        className={"text-xl rounded-full active:bg-slate-600 cursor-pointer"}
        options={[
          {
            onClick: () => dispatch(exportPatternToMIDI(id)),
            label: "Export MIDI",
          },
          {
            onClick: () => dispatch(downloadPatternAsXML(id)),
            label: "Export XML",
          },
        ]}
      >
        <GiArrowDunk />
      </EditorTooltipButton>
    );
  };

  return (
    <EditorTab show={true} border>
      <EditorTabGroup border={isCustom}>
        <span className="font-thin text-emerald-400">Pattern:</span>
        {ExportButton()}
        {CopyButton()}
        <PatternEditorInstrumentBox {...props} />
      </EditorTabGroup>
      {!!props.isCustom && <PatternEditorTabs {...props} />}
    </EditorTab>
  );
}
