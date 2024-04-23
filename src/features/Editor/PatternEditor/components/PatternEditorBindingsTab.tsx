import * as Listbox from "features/Editor/components/EditorListbox";
import { PatternEditorProps } from "../PatternEditor";
import { useProjectDeepSelector } from "redux/hooks";
import { selectPatternTracks, selectTrackLabelMap } from "redux/selectors";
import {
  autoBindPattern,
  clearPatternBindings,
  updatePattern,
} from "redux/Pattern";
import { Editor } from "features/Editor/components";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";

export function PatternEditorBindingsTab(props: PatternEditorProps) {
  const { dispatch, pattern, Tooltip, Button } = props;
  const trackLabels = useProjectDeepSelector(selectTrackLabelMap);

  // Get the pattern track for this pattern.
  const ptId = pattern?.patternTrackId;
  const patternTracks = useProjectDeepSelector(selectPatternTracks);
  const patternTrackOptions = ["no-track", ...patternTracks.map((t) => t.id)];
  const patternTrack = patternTracks.find((t) => t.id === ptId);

  /** The user can use a custom instrument for a pattern. */
  const InstrumentField = () => (
    <Tooltip content={`Select Instrument`}>
      <div className="h-5 my-2 flex text-xs items-center space-x-2">
        <label className="px-1">Preset Instrument:</label>
        <Listbox.InstrumentListbox
          value={pattern?.instrumentKey ?? DEFAULT_INSTRUMENT_KEY}
          setValue={(value) => {
            if (!pattern) return;
            dispatch(updatePattern({ ...pattern, instrumentKey: value }));
            props.setInstrument(value);
          }}
        />
      </div>
    </Tooltip>
  );

  /** The user can bind a pattern track to a pattern. */
  const PatternTrackField = () => (
    <Tooltip content={`Select Pattern Track`}>
      <div className="h-5 my-2 flex text-xs items-center space-x-2">
        <span>Bind to Track:</span>
        <Editor.CustomListbox
          options={patternTrackOptions}
          borderColor={patternTrack ? "border-emerald-500" : "border-slate-500"}
          value={patternTrack?.id ?? "no-track"}
          getOptionName={(option) =>
            option === "no-track"
              ? "No Pattern Track"
              : `Pattern Track (${trackLabels[option]})`
          }
          setValue={(value) => {
            if (!pattern) return;
            if (value === "no-track") {
              dispatch(clearPatternBindings(pattern?.id, true));
            } else {
              dispatch(updatePattern({ ...pattern, patternTrackId: value }));
            }
          }}
        />
      </div>
    </Tooltip>
  );

  /** The user can choose to auto-bind their pattern or clear all binds. */
  const NoteBindField = () => (
    <div className="flex text-xs items-center space-x-2">
      <span>Notes:</span>
      <Button
        border
        className="focus:opacity-80 focus:border-emerald-500 focus:text-emerald-400"
        label="Auto-Bind to Track Scales"
        onClick={() => dispatch(autoBindPattern(pattern?.id))}
      >
        Auto-Bind
      </Button>
      <Button
        border
        className="focus:opacity-80"
        label="Clear All Note Bindings"
        onClick={() => dispatch(clearPatternBindings(pattern?.id))}
      >
        Clear Binds
      </Button>
    </div>
  );

  return (
    <Editor.Tab show={props.isCustom} border={false}>
      <Editor.TabGroup border={false}>
        <InstrumentField />
      </Editor.TabGroup>
      <Editor.TabGroup border={false}>
        <PatternTrackField />
      </Editor.TabGroup>
      {!!pattern?.patternTrackId && (
        <Editor.TabGroup border={false}>
          <NoteBindField />
        </Editor.TabGroup>
      )}
    </Editor.Tab>
  );
}
