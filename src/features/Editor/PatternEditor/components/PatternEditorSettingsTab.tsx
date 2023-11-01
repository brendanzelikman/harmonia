import * as Listbox from "features/Editor/components/Listbox";
import { PatternEditorProps } from "../PatternEditor";
import { useProjectDeepSelector } from "redux/hooks";
import { selectPatternTracks, selectTrackLabelMap } from "redux/selectors";
import { updatePattern } from "redux/Pattern";
import { Editor } from "features/Editor/components";

export function PatternEditorSettingsTab(props: PatternEditorProps) {
  const { dispatch, pattern, Tooltip } = props;
  const trackLabels = useProjectDeepSelector(selectTrackLabelMap);

  // Get the pattern track for this pattern.
  const ptId = pattern?.patternTrackId;
  const patternTracks = useProjectDeepSelector(selectPatternTracks);
  const patternTrackOptions = ["no-track", ...patternTracks.map((t) => t.id)];
  const patternTrack = patternTracks.find((t) => t.id === ptId);

  /** The user can bind a pattern track to a pattern. */
  const PatternTrackField = () => (
    <Tooltip content={`Select Pattern Track`}>
      <div className="h-5 my-2 flex text-xs items-center space-x-2">
        <span>Bind to Track:</span>
        <Editor.CustomListbox
          options={patternTrackOptions}
          value={patternTrack?.id ?? "no-track"}
          getOptionName={(option) =>
            option === "no-track"
              ? "No Pattern Track"
              : `Pattern Track (${trackLabels[option]})`
          }
          setValue={(value) => {
            if (!pattern) return;
            const patternTrackId = value === "no-track" ? undefined : value;
            dispatch(updatePattern({ ...pattern, patternTrackId }));
          }}
        />
      </div>
    </Tooltip>
  );

  /** The user can use a custom instrument for a pattern. */
  const InstrumentField = () => (
    <Tooltip content={`Select Instrument`}>
      <div className="h-5 my-2 flex text-xs items-center space-x-2">
        <label className="px-1">Preset Instrument:</label>
        <Listbox.InstrumentListbox
          value={pattern?.instrumentKey ?? "grand_piano"}
          setValue={(value) => {
            if (!pattern) return;
            dispatch(updatePattern({ ...pattern, instrumentKey: value }));
            props.setInstrument(value);
          }}
        />
      </div>
    </Tooltip>
  );

  return (
    <Editor.Tab show={props.isCustom} border={false}>
      <Editor.TabGroup border={false}>
        <InstrumentField />
      </Editor.TabGroup>
      <Editor.TabGroup border={false}>
        <PatternTrackField />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
