import { Editor } from "features/Editor/components";
import { NumericInputOption, useNumericInputs } from "hooks";
import { useEffect } from "react";
import { updatePatternBlock } from "redux/Pattern";
import {
  selectTrackScaleMap,
  selectTrackMidiScaleMap,
  selectTrackLabelMap,
  selectScaleTrackChainIds,
  selectTrackScaleChain,
  selectTrackIdsWithPossibleScales,
  selectScaleTracksByIds,
  selectScaleTrackChain,
} from "redux/Track";
import { getDegreeOfNoteInTrack } from "redux/thunks";
import {
  editPatternChordStrum,
  getPatternChordNotes,
  isPatternBlockedChord,
  isPatternChord,
  isPatternMidiNote,
  isPatternNote,
  isPatternStrummedChord,
  PatternBlock,
  PatternChord,
  togglePatternChordStrum,
  updatePatternChordNotes,
} from "types/Pattern";
import { isNestedNote, NestedNote } from "types/Scale";
import { getMidiOctaveDistance } from "utils/midi";
import { getValueByKey } from "utils/objects";
import {
  useProjectDeepSelector,
  useProjectSelector as useSelector,
} from "redux/hooks";
import { PatternEditorProps } from "../PatternEditor";
import { usePatternEditorChordIndex } from "../hooks/usePatternEditorChordIndex";
import { isUndefined } from "lodash";

export function PatternEditorChordTab(props: PatternEditorProps) {
  const { dispatch, pattern, cursor, block, notes, Tooltip } = props;
  const id = pattern?.id;
  const trackId = pattern?.patternTrackId;
  const index = cursor?.index;

  // Track info
  const trackScaleMap = useSelector(selectTrackScaleMap);
  const trackMidiScaleMap = useSelector(selectTrackMidiScaleMap);
  const trackLabelMap = useSelector(selectTrackLabelMap);
  const trackChainIds = useSelector((_) =>
    selectScaleTrackChainIds(_, trackId)
  );
  const trackChain = useSelector((_) =>
    selectScaleTracksByIds(_, trackChainIds)
  );

  // Currently indexed chord
  const { chordIndex, setChordIndex } = usePatternEditorChordIndex(props);
  const patternChord = isPatternChord(block)
    ? (block as PatternChord)
    : undefined;
  const patternNote = patternChord
    ? getPatternChordNotes(patternChord)[chordIndex]
    : isPatternNote(block)
    ? block
    : undefined;
  const isNested = isNestedNote(patternNote);
  const nestedNote = isNested ? (patternNote as NestedNote) : undefined;
  const midiNote = notes?.[chordIndex];

  // Currently indexed nested note
  const noteScaleId = nestedNote?.scaleId;
  const noteTrack = trackChain.find((t) => t.scaleId === noteScaleId);
  const noteTracks = useSelector((_) =>
    selectScaleTrackChain(_, noteTrack?.id)
  );
  const noteScaleIds = useProjectDeepSelector((_) => [
    "chromatic",
    ...selectTrackScaleChain(_, noteTrack?.id).map((s) => s.id),
  ]);

  /** The user can select the current index of the chord. */
  const ChordIndexField = () => {
    const options = notes ? notes.map((note) => note.MIDI) : [];
    if (!block || !midiNote) return null;
    const isChord = !notes?.length;
    return (
      <Tooltip content={`Select Note Scale`}>
        <div className="h-5 flex text-xs items-center">
          <Editor.CustomListbox
            value={midiNote.MIDI}
            disabled={isChord}
            options={options}
            getOptionName={(option) => `MIDI = ${option}`}
            setValue={(value) => setChordIndex(options.indexOf(value))}
          />
        </div>
      </Tooltip>
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
        if (!id || !patternChord) return;
        const velocity = isUndefined(value) ? 0 : value;
        const notes = getPatternChordNotes(patternChord);
        const newChord = notes.map((note, i) =>
          i === chordIndex ? { ...note, velocity } : note
        );
        const newBlock = updatePatternChordNotes(patternChord, newChord);
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
      },
    },
  ]);
  const VelocityField = (
    <Editor.NumericField
      className="w-24 bg-transparent border-slate-500  focus:border-teal-500/80"
      value={Velocity.getValue("velocity")}
      onChange={Velocity.onChange("velocity")}
      min={0}
      max={127}
      leadingText="Velocity = "
    />
  );

  const scaleTrackOptions = useSelector((_) => [
    "no-scale",
    ...selectTrackIdsWithPossibleScales(_, trackChainIds, patternNote),
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
    const getOptionName = (trackId: string) => {
      const degree = dispatch(getDegreeOfNoteInTrack(trackId, patternNote));
      const trackLabel = trackLabelMap[trackId];
      if (disabled) return "No Scales Available";
      if (trackId === "no-scale") return "Locking MIDI Note";
      if (degree < 0) return `Scale Track (${trackLabel})`;

      // Otherwise, show the track label and degree
      return `(ST. ${trackLabel}) Degree = ${degree + 1}`;
    };

    /** Set the value of the option */
    const setValue = (trackId: string) => {
      if (!id || !block || !notes || !patternChord) return;
      const blockNotes = isPatternChord(block)
        ? getPatternChordNotes(block)
        : [];

      // If selecting no scale, remove all scale info
      if (trackId === "no-scale") {
        const newChord = blockNotes.map((note, i) => {
          const { duration, velocity } = note;
          if (i !== chordIndex) return note;
          return { MIDI: notes[i].MIDI, duration, velocity };
        });
        const newBlock = updatePatternChordNotes(patternChord, newChord);
        dispatch(updatePatternBlock({ id, index, block: newBlock }));
        return;
      }

      // Otherwise, get the would-be degree of the note in the track
      const degree = dispatch(getDegreeOfNoteInTrack(trackId, patternNote));
      const midiScale = trackMidiScaleMap[trackId];
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
      const newBlock = updatePatternChordNotes(patternChord, newChord);

      // Update the block
      dispatch(updatePatternBlock({ id, index, block: newBlock }));
    };

    return (
      <Tooltip content={`Select Note Scale`}>
        <div className="h-5 flex text-xs items-center">
          <Editor.CustomListbox
            value={value}
            disabled={disabled}
            options={scaleTrackOptions}
            getOptionName={getOptionName}
            setValue={setValue}
          />
        </div>
      </Tooltip>
    );
  };

  /** The user can set the offsets of a note with a variable number of input fields. */
  const onOffsetChange = (scaleId: string, offset: number) => {
    if (!id || !scaleId || !nestedNote || !block) return;
    if (!isPatternChord(block)) return;
    const notes = getPatternChordNotes(block);
    const newChord = notes.map((note, i) =>
      i === chordIndex && isNestedNote(note)
        ? { ...note, offset: { ...note.offset, [scaleId]: offset } }
        : note
    );
    const newBlock = updatePatternChordNotes(block, newChord);
    dispatch(updatePatternBlock({ id, index, block: newBlock }));
  };

  /** All note scales are available, as well as the chromatic scale. */
  const offsetOptions: NumericInputOption[] = noteScaleIds.map((scaleId) => ({
    id: scaleId,
    initialValue: nestedNote?.offset?.[scaleId],
    callback: (value) => {
      if (isUndefined(value)) onOffsetChange(scaleId, 0);
      else onOffsetChange(scaleId, value);
    },
  }));

  /** Each note offset has a corresponding input */
  const NoteOffsets = useNumericInputs(!nestedNote ? [] : offsetOptions);
  const NoteOffsetFields = !nestedNote
    ? null
    : noteScaleIds.map((id) => {
        // Get the track label and current note input value
        const track = noteTracks.find((t) => t.scaleId === id);
        const trackLabel = track ? trackLabelMap[track.id] : undefined;
        return (
          <Editor.NumericField
            key={id}
            className="w-[4.5rem] bg-transparent border-slate-500  focus:border-teal-500/80"
            value={NoteOffsets.getValue(id)}
            onChange={NoteOffsets.onChange(id)}
            leadingText={id === "chromatic" ? "N = " : `T(${trackLabel}) = `}
            min={-100}
            max={100}
          />
        );
      });

  /* Set the velocity and offset fields when the cursor changes. */
  useEffect(() => {
    // Update the velocity for all notes
    const velocity = patternNote?.velocity;
    if (velocity !== undefined) {
      Velocity.setValue("velocity", velocity.toString());
    }

    // Update the offsets for nested notes
    if (!nestedNote) return;
    noteScaleIds.forEach((id) => {
      const offsets = nestedNote.offset || {};
      const offset = getValueByKey(offsets, id);
      const currentValue = NoteOffsets.getValue(id);
      if (!isUndefined(offset) && currentValue !== "-") {
        NoteOffsets.setValue(id, offset.toString());
      } else if (currentValue !== "-") {
        NoteOffsets.setValue(id, "0");
      }
    });
  }, [chordIndex, noteScaleIds, patternNote, nestedNote]);

  /** Toggle the chord strum between "off", "up", and "down" */
  const ChordStrumDirection = () => {
    type StrumDirection = "off" | "up" | "down";
    const options: StrumDirection[] = ["off", "up", "down"];

    // Get the current value from the block
    const value = isPatternStrummedChord(block) ? block.strumDirection : "off";

    // Set the value based on the current block
    const setValue = (value: StrumDirection) => {
      if (!id) return;
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
      <Tooltip content={`Select Note Scale`}>
        <div className="h-5 flex text-xs items-center">
          <Editor.CustomListbox
            value={value}
            options={options}
            getOptionName={(option) => `Strum = ${option}`}
            setValue={setValue}
          />
        </div>
      </Tooltip>
    );
  };

  /** Adjust the range of the chord strum if it is enabled. */
  const StrumRangeInputs = useNumericInputs([
    {
      id: "strumRange-0",
      initialValue: 0,
      min: 0,
      callback: (value) => {
        if (!id) return;
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
        if (!id) return;
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
        <Editor.NumericField
          className="w-20 bg-transparent border-slate-500  focus:border-teal-500/80"
          value={StrumRangeInputs.getValue("strumRange-0")}
          onChange={StrumRangeInputs.onChange("strumRange-0")}
          min={0}
          leadingText="Before = "
        />
        <Editor.NumericField
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
  }, [chordIndex, block]);

  return (
    <Editor.Tab show={props.isCustom && !cursor.hidden} border={false}>
      <Editor.TabGroup border>
        <ChordIndexField />
        {VelocityField}
      </Editor.TabGroup>
      <Editor.TabGroup border>
        <ChordStrumDirection />
        {ChordStrumRange()}
      </Editor.TabGroup>
      <Editor.TabGroup>
        <ScaleTrackField />
        {NoteOffsetFields}
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
