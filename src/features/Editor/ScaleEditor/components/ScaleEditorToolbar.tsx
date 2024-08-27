import { ScaleEditorProps } from "../ScaleEditor";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import {
  EditorListbox,
  InstrumentListbox,
} from "features/Editor/components/EditorListbox";
import { GiArrowDunk, GiStack } from "react-icons/gi";
import { EditorTooltipButton } from "components/TooltipButton";
import { FaPlayCircle } from "react-icons/fa";
import { use, useProjectDispatch, useProjectSelector } from "types/hooks";
import { getScaleName, getScaleNotes } from "types/Scale/ScaleFunctions";
import {
  selectScaleTrackById,
  selectTrackMidiScaleMap,
} from "types/Track/TrackSelectors";
import { selectScaleName } from "types/Arrangement/ArrangementTrackSelectors";
import {
  exportScaleToMIDI,
  exportScaleToXML,
} from "types/Scale/ScaleExporters";
import { createScale, playScale } from "types/Scale/ScaleThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import classNames from "classnames";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";

export function ScaleEditorToolbar(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { midiScale, scale, scaleName } = props;
  const notes = getScaleNotes(scale);
  const trackScaleMap = use(selectTrackMidiScaleMap);
  const nestedScaleTracks = props.track?.trackIds.filter(isScaleTrackId) ?? [];

  const ExportButton = () => {
    return (
      <EditorTooltipButton
        className="rounded-full"
        label="Export Scale"
        options={[
          {
            onClick: () => scale && dispatch(exportScaleToMIDI(midiScale)),
            label: "Export MIDI",
          },
          {
            onClick: () => scale && exportScaleToXML(midiScale, true),
            label: "Export XML",
          },
        ]}
      >
        <GiArrowDunk className="text-xl" />
      </EditorTooltipButton>
    );
  };

  const SaveButton = () => (
    <EditorTooltipButton
      label="Save Scale"
      className="active:bg-sky-600 rounded-full"
      onClick={() =>
        dispatch(createScale({ data: { ...scale, name: scaleName } }))
      }
    >
      <GiStack className="text-xl" />
    </EditorTooltipButton>
  );

  /** The user can play a preview of the scale. */
  const PlayButton = () => (
    <EditorTooltipButton
      label="Play Scale"
      className="active:text-emerald-500 rounded-full"
      onClick={() => !!scale && dispatch(playScale(scale))}
      disabled={!notes.length}
    >
      <FaPlayCircle className="text-xl" />
    </EditorTooltipButton>
  );

  /** The user can change the instrument of the scale. */
  const ScaleInstrumentListbox = () => (
    <InstrumentListbox
      value={props.instance?.key ?? DEFAULT_INSTRUMENT_KEY}
      setValue={props.setInstrument}
    />
  );

  const parentScaleTrack = useProjectSelector((_) =>
    isScaleTrackId(props.track?.parentId)
      ? selectScaleTrackById(_, props.track?.parentId)
      : undefined
  );
  const parentScaleName = useProjectSelector((_) =>
    selectScaleName(_, parentScaleTrack?.scaleId)
  );

  return (
    <EditorTab className="z-20" show={true} border={true}>
      <EditorTabGroup border>
        <span className="font-thin text-sky-400">Scale:</span>
        <ExportButton />
        <SaveButton />
        <PlayButton />
        <ScaleInstrumentListbox />
      </EditorTabGroup>
      <EditorTabGroup border>
        <span className="text-sky-400 font-thin">Parent:</span>
        <span
          className={classNames(
            "truncate max-w-52",
            parentScaleTrack !== undefined
              ? "text-slate-50 hover:text-sky-200 active:text-sky-400 cursor-pointer"
              : "opacity-80"
          )}
          onClick={() =>
            parentScaleTrack !== undefined &&
            dispatch(setSelectedTrackId({ data: parentScaleTrack?.id }))
          }
        >
          {parentScaleName ?? "Chromatic Scale"}
        </span>
      </EditorTabGroup>
      <EditorTabGroup border>
        <span className="text-sky-400 font-thin">Children:</span>
        {!!nestedScaleTracks.length ? (
          <EditorListbox
            options={[null, ...nestedScaleTracks]}
            value={null}
            setValue={(value) => dispatch(setSelectedTrackId({ data: value }))}
            getOptionName={(id) =>
              id === null ? "Select a Child" : getScaleName(trackScaleMap[id])
            }
            placeholder="View Tracks"
          />
        ) : (
          <span>None</span>
        )}
      </EditorTabGroup>
    </EditorTab>
  );
}
