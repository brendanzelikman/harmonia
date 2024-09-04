import * as Listbox from "features/Editor/components/EditorListbox";
import { PatternEditorProps } from "../PatternEditor";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { updatePattern } from "types/Pattern/PatternSlice";
import {
  selectOrderedTrackIds,
  selectPatternTracks,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import {
  clearPatternBindings,
  autoBindPattern,
} from "types/Pattern/PatternThunks";
import { EditorButton } from "features/Editor/components/EditorButton";
import classNames from "classnames";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";

export function PatternEditorBindingsTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern } = props;
  const trackLabels = useDeep(selectTrackLabelMap);
  const patternTracks = useDeep(selectPatternTracks);

  // Get the pattern track for this pattern.
  const ptIds = use(selectOrderedTrackIds).filter(isPatternTrackId);
  const ptId = pattern?.trackId;
  const hasPtId = ptId !== undefined;
  const hasNotes = (props.pattern?.stream ?? []).length > 0;
  const patternTrackOptions: (TrackId | "no-track")[] = ["no-track", ...ptIds];
  const patternTrack = patternTracks.find((t) => t.id === ptId);

  /** The user can bind a pattern track to a pattern. */
  const PatternTrackField = () => (
    <div className="my-2 flex items-center space-x-2">
      <span className="text-emerald-400 font-thin whitespace-nowrap">
        Pattern Track:
      </span>
      <Listbox.EditorListbox
        options={patternTrackOptions}
        borderColor={patternTrack ? "border-emerald-500" : "border-slate-500"}
        value={patternTrack?.id ?? "no-track"}
        getOptionName={(option: TrackId | "no-track") =>
          option === "no-track"
            ? "No Pattern Track"
            : `Track ${trackLabels[option]}`
        }
        setValue={(value) => {
          if (!pattern) return;
          if (value === "no-track") {
            dispatch(clearPatternBindings(pattern?.id, true));
          } else {
            dispatch(updatePattern({ data: { ...pattern, trackId: value } }));
          }
        }}
      />
    </div>
  );

  /** The user can choose to auto-bind their pattern or clear all binds. */
  const NoteBindField = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sky-400 font-thin whitespace-nowrap">
        Scale Degrees:
      </span>
      {hasNotes ? (
        <>
          {" "}
          <EditorButton
            className={classNames(
              `border border-slate-500`,
              hasPtId
                ? "active:opacity-80 active:border-emerald-500 active:text-emerald-400"
                : "opacity-80 cursor-default"
            )}
            label="Auto-Bind to Track Scales"
            disabled={!hasPtId || !hasNotes}
            onClick={() => hasPtId && dispatch(autoBindPattern(pattern?.id))}
          >
            Auto-Bind Pattern
          </EditorButton>
          <EditorButton
            className="border border-slate-500 focus:opacity-80"
            label="Clear All Note Bindings"
            onClick={() => dispatch(clearPatternBindings(pattern?.id))}
          >
            Clear Binds
          </EditorButton>
        </>
      ) : (
        <span className="text-sky-200 text-sm font-thin">
          Add Notes to Bind Your Pattern
        </span>
      )}
    </div>
  );

  return (
    <EditorTab show={props.isCustom} border={false}>
      <EditorTabGroup border={false}>
        <PatternTrackField />
      </EditorTabGroup>
      {hasPtId && (
        <EditorTabGroup border={false}>{NoteBindField()}</EditorTabGroup>
      )}
    </EditorTab>
  );
}
