import { useEffect, useState } from "react";
import { getMidiDegree, getMidiOctaveDistance, getMidiPitch } from "utils/midi";
import { getArrayByKey, getValueByKey } from "utils/objects";
import { useDeep, useProjectDispatch } from "types/hooks";
import { PatternEditorProps } from "../PatternEditor";
import { usePatternEditorChordIndex } from "../hooks/usePatternEditorChordIndex";
import { isString, isUndefined } from "lodash";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { EditorListbox } from "features/Editor/components/EditorListbox";
import { EditorNumericField } from "features/Editor/components/EditorField";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { getPatternChordNotes } from "types/Pattern/PatternUtils";
import { getPatternChordWithNewNotes } from "types/Pattern/PatternUtils";
import {
  removePatternBlock,
  updatePatternBlock,
} from "types/Pattern/PatternSlice";
import {
  isPatternNote,
  isPatternChord,
  PatternBlock,
  isPatternMidiNote,
} from "types/Pattern/PatternTypes";
import {
  isNestedNote,
  NestedNote,
  ScaleVectorId,
} from "types/Scale/ScaleTypes";
import {
  selectTrackScaleMap,
  selectTrackMidiScaleMap,
  selectTrackLabelMap,
  selectTrackChainIds,
  selectScaleTracksByIds,
  selectTrackChain,
  selectTrackScaleChain,
  selectTrackIdsWithPossibleScales,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { getDegreeOfNoteInTrack } from "types/Track/TrackThunks";
import { useNumericInputs, NumericInputOption } from "hooks/useNumericInputs";

export function PatternEditorBlockTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { id, ptId, cursor, index, block, chord, midiNotes } = props;
  const isValid = !!id && index !== undefined;
  const isChordValid = isValid && !!chord;
  const { chordIndex, setChordIndex } = usePatternEditorChordIndex(props);
  const holding = useHeldHotkeys("alt");

  // Track info
  const trackScaleMap = useDeep(selectTrackScaleMap);
  const trackMidiScaleMap = useDeep(selectTrackMidiScaleMap);
  const trackLabelMap = useDeep(selectTrackLabelMap);
  const trackChainIds = useDeep((_) => selectTrackChainIds(_, ptId));
  const trackChain = useDeep((_) => selectScaleTracksByIds(_, trackChainIds));

  // Currently indexed chord
  const note = chord
    ? getPatternChordNotes(chord)[chordIndex]
    : isPatternNote(block)
    ? block
    : undefined;
  const isNested = isNestedNote(note);
  const nestedNote = isNested ? (note as NestedNote) : undefined;
  const midiNote = midiNotes?.[chordIndex];

  // Currently indexed nested note
  const noteScaleId = nestedNote?.scaleId;
  const noteTrack = trackChain.find((t) => t.scaleId === noteScaleId);
  const noteTracks = useDeep((_) => selectTrackChain(_, noteTrack?.id));
  const noteScaleIds = useDeep(
    (_) =>
      [
        "chromatic",
        ...selectTrackScaleChain(_, noteTrack?.id).map((s) => s.id),
      ] as ScaleVectorId[]
  );

  /** The user can select the current index of the chord. */
  const ChordIndexField = () => {
    const options = midiNotes ?? [];
    if (!midiNote || index === undefined) return null;
    const isChord = midiNotes.length > 1;
    const onClick = () => {
      if (!isChordValid) return;
      const notes = getPatternChordNotes(chord);
      const newNotes = notes.filter((_, i) => i !== chordIndex);
      const newBlock = getPatternChordWithNewNotes(chord, newNotes);
      if (!newNotes.length) {
        dispatch(removePatternBlock({ id, index }));
      } else {
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
      }
    };
    return (
      <div className="h-5 flex text-xs items-center">
        <EditorListbox
          borderColor={holding.alt ? "border-red-500" : undefined}
          value={midiNote}
          options={options}
          getOptionKey={(option, i) => `note-${i}-${option.MIDI}`}
          getOptionName={(option) =>
            `${getMidiPitch(option.MIDI)} / MIDI = ${option.MIDI}`
          }
          setValue={(value) => setChordIndex(options.indexOf(value))}
          onClick={holding.alt ? onClick : undefined}
        />
      </div>
    );
  };

  /** The user can set the velocity of a block with an input field. */
  const Velocity = useNumericInputs([
    {
      id: "velocity",
      initialValue: 100,
      min: 0,
      max: 127,
      callback: (value) => {
        if (!id || !chord || index === undefined) return;
        const velocity = isUndefined(value) ? 0 : value;
        const notes = getPatternChordNotes(chord);
        const newChord = notes.map((note, i) =>
          i === chordIndex ? { ...note, velocity } : note
        );
        const newBlock = getPatternChordWithNewNotes(chord, newChord);
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
      },
    },
  ]);
  const VelocityField = (
    <EditorNumericField
      className="w-24 bg-transparent border-slate-500  focus:border-teal-500/80"
      value={Velocity.getValue("velocity")}
      onChange={Velocity.onChange("velocity")}
      min={0}
      max={127}
      leadingText="Velocity = "
    />
  );

  const scaleTrackOptions: (TrackId | "no-scale")[] = useDeep((_) => [
    "no-scale",
    ...selectTrackIdsWithPossibleScales(_, trackChainIds, note),
  ]);

  /** The user can select a scale to bind to the note using its scale track. */
  const ScaleTrackField = () => {
    const disabled = scaleTrackOptions.length === 1;

    // Try to find the track that matches the note's scale
    const track = trackChain.find(
      ({ scaleId }) => noteScaleId && noteScaleId === scaleId
    );
    const value = track?.id || "no-scale";

    // Get the option's name using the track label and would-be degree
    const getOptionName = (trackId: TrackId | "no-scale") => {
      if (trackId === "no-scale") {
        const chromaticNumber = getMidiDegree(midiNote?.MIDI);
        return `${chromaticNumber + 1} (Chromatic)`;
      }
      let degree = dispatch(getDegreeOfNoteInTrack(trackId, note));
      if (degree === -1 && isNestedNote(note)) {
        degree = note.degree;
      }
      const trackLabel = trackLabelMap[trackId];
      if (disabled) return "No Scales Available";
      if (!midiNote) return "No Scale";

      // Otherwise, show the track label and degree
      return `${degree + 1} (Track ${trackLabel})`;
    };

    /** Set the value of the option */
    const setValue = (trackId: TrackId | "no-scale") => {
      if (!id || !block || !midiNotes || !chord || index === undefined) return;
      const blockNotes = isPatternChord(block)
        ? getPatternChordNotes(block)
        : [];

      // If selecting no scale, remove all scale info
      if (trackId === "no-scale") {
        const newChord = blockNotes.map((note, i) => {
          const { duration, velocity } = note;
          if (i !== chordIndex) return note;
          return { MIDI: midiNotes[i].MIDI, duration, velocity };
        });
        const newBlock = getPatternChordWithNewNotes(chord, newChord);
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
        return;
      }

      // Otherwise, get the would-be degree of the note in the track
      const degree = dispatch(getDegreeOfNoteInTrack(trackId, note));
      const midiScale = getArrayByKey(trackMidiScaleMap, trackId);
      const scaleId = trackScaleMap[trackId]?.id;

      // Update the new block using the scale degrees
      const newChord: PatternBlock = blockNotes.map((note, i) => {
        if (i !== chordIndex) return note;

        // Get the info for the note
        const { duration, velocity } = note;

        // Use the current note's offset or only the octave offset on a MIDI note
        const offset = { ...(nestedNote?.offset || {}) };
        if (!nestedNote && isPatternMidiNote(note)) {
          const octave = getMidiOctaveDistance(midiScale[degree], note.MIDI);
          offset["octave"] = octave;
        }

        // Return the note without any MIDI
        return { scaleId, degree, offset, duration, velocity };
      });
      const newBlock = getPatternChordWithNewNotes(chord, newChord);

      // Update the block
      dispatch(updatePatternBlock({ id, index, block: newBlock }));
    };

    return (
      <div className="h-5 flex text-xs items-center">
        <EditorListbox
          value={value}
          disabled={disabled}
          options={scaleTrackOptions}
          getOptionName={getOptionName}
          setValue={setValue}
        />
      </div>
    );
  };

  /** The user can set the offsets of a note with a variable number of input fields. */
  const onOffsetChange = (scaleId: string, offset: number) => {
    if (!id || !scaleId || !nestedNote || !block || index === undefined) return;
    if (!isPatternChord(block)) return;
    const notes = getPatternChordNotes(block);
    const newChord = notes.map((note, i) =>
      i === chordIndex && isNestedNote(note)
        ? { ...note, offset: { ...note.offset, [scaleId]: offset } }
        : note
    );
    const newBlock = getPatternChordWithNewNotes(block, newChord);
    dispatch(updatePatternBlock({ id, index, block: newBlock }));
  };

  /** All note scales are available, as well as the chromatic scale. */
  const [selectedOffset, setSelectedOffset] =
    useState<ScaleVectorId>("chromatic");
  const selectedTrack = noteTracks.find(
    (track) => track.scaleId === selectedOffset
  );
  const offsetOption: NumericInputOption = {
    id: selectedOffset,
    initialValue: getValueByKey(nestedNote?.offset, selectedOffset),
    callback: (value) => {
      if (isUndefined(value)) onOffsetChange(selectedOffset, 0);
      else onOffsetChange(selectedOffset, value);
    },
  };

  /** Each note offset has a corresponding input */
  const NoteOffset = useNumericInputs(!nestedNote ? [] : [offsetOption]);
  const NoteOffsetField = () => (
    <EditorNumericField
      key={id}
      className="w-[5rem] bg-transparent border-slate-500 focus:border-teal-500/80"
      value={NoteOffset.getValue(selectedOffset)}
      onChange={NoteOffset.onChange(selectedOffset)}
      leadingText={`Offset = `}
      min={-100}
      max={100}
      defaultValue={0}
    />
  );

  /* Set the velocity and offset fields when the cursor changes. */
  useEffect(() => {
    // Update the velocity for all notes
    const velocity = note?.velocity;
    if (velocity !== undefined) {
      Velocity.setValue("velocity", velocity.toString());
    }

    // Update the offsets for nested notes
    if (!nestedNote) return;
    noteScaleIds.forEach((id) => {
      const offsets = nestedNote.offset || {};
      const offset = getValueByKey(offsets, id);
      const currentValue = NoteOffset.getValue(id);
      if (!isUndefined(offset) && currentValue !== "-") {
        NoteOffset.setValue(id, offset.toString());
      } else if (currentValue !== "-") {
        NoteOffset.setValue(id, "0");
      }
    });
  }, [chordIndex, noteScaleIds, note, nestedNote]);

  return (
    <EditorTab
      show={props.isCustom && !cursor.hidden}
      border={false}
      className="h-14 flex items-center bg-slate-900/80 rounded border border-emerald-500"
    >
      <EditorTabGroup border={!props.onRest && !!props.ptId}>
        <span className="text-emerald-400 font-thin whitespace-nowrap">
          Block #{props.index !== undefined ? `${props.index + 1}` : ""}
          {": "}
          {props.isChord ? "Chord" : props.onRest ? "Rest" : "Note"}{" "}
        </span>
        <ChordIndexField />
        {!props.onRest && VelocityField}
      </EditorTabGroup>
      {!props.onRest && props.ptId && (
        <EditorTabGroup border={!!nestedNote}>
          <span className="text-sky-400 font-thin whitespace-nowrap">
            Scale Degree:
          </span>
          <ScaleTrackField />
        </EditorTabGroup>
      )}
      {!!nestedNote && (
        <EditorTabGroup>
          <span className="text-base text-fuchsia-400 font-thin my-auto">
            Transpose:
          </span>
          <EditorListbox
            borderColor={holding.alt ? "border-red-500" : undefined}
            options={["chromatic", ...noteTracks] as ScaleVectorId[]}
            getOptionKey={(option, i) =>
              isString(option) ? "chromatic-key" : `track-${i}-${option.id}`
            }
            getOptionName={(option, i) => {
              if (isString(option)) return "Chromatic Scale";
              return `Track ${trackLabelMap[option.id]} Scale`;
            }}
            value={selectedTrack ?? ("chromatic" as ScaleVectorId)}
            setValue={(value) =>
              setSelectedOffset(isString(value) ? value : value.scaleId)
            }
          />
          {NoteOffsetField()}
        </EditorTabGroup>
      )}
    </EditorTab>
  );
}
