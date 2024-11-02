import { useCallback, useMemo, useState } from "react";
import { ScoreProps } from "lib/opensheetmusicdisplay";
import { usePatternEditorHotkeys } from "./hooks/usePatternEditorHotkeys";
import { useDeep, useProjectDispatch } from "types/hooks";
import { PresetPatternMap } from "assets/patterns";
import { EditorProps } from "features/Editor/Editor";
import { usePatternEditorScore } from "./hooks/usePatternEditorScore";
import { Input } from "webmidi";
import { getDurationTicks } from "utils/durations";
import { getValueByKey } from "utils/objects";
import { EditorBody } from "../components/EditorBody";
import { EditorContainer } from "../components/EditorContainer";
import { PatternEditorContent } from "./components/PatternEditorContent";
import { PatternEditorContextMenu } from "./components/PatternEditorContextMenu";
import { PatternEditorPiano } from "./components/PatternEditorPiano";
import { PatternEditorSidebar } from "./components/PatternEditorSidebar";
import {
  getPatternBlockAtIndex,
  updatePatternBlockDuration,
} from "types/Pattern/PatternFunctions";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import {
  PatternId,
  PatternBlock,
  PatternChord,
  PatternMidiNote,
  isPatternChord,
  PatternMidiChord,
} from "types/Pattern/PatternTypes";
import {
  addPatternBlock,
  updatePatternBlock,
  insertPatternBlock,
  removePatternBlock,
} from "types/Pattern/PatternSlice";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { resolvePatternBlockToMidi } from "types/Pattern/PatternResolvers";

/** The pattern editor uses the pattern history and a score. */
export interface PatternEditorProps extends EditorProps, ScoreProps {
  tabs: string[];
  tab: string;
  setTab: (tab: string) => void;

  // The pattern editor passes additional information about the pattern
  id?: PatternId;
  ptId?: TrackId;
  isCustom: boolean;
  isEmpty: boolean;
  index?: number;

  // The pattern editor passes down the current block using the cursor index
  block?: PatternBlock;
  chord?: PatternChord;
  midiNotes?: PatternMidiNote[];

  // The pattern editor can have a current note with the cursor
  onRest: boolean;
  onNotes: boolean;
  isChord: boolean;

  // The pattern editor has specific score callbacks
  onBlockClick: () => void;
  onRestClick: () => void;
  onEraseClick: () => void;

  // The pattern editor can have a MIDI input selected
  midiInput?: Input;
  setMidiInput: (input: Input) => void;
}

function PatternEditorComponent(props: EditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, isAdding, isInserting, isRemoving } = props;
  const duration = getDurationTicks(props.settings.note.duration);

  // The pattern editor uses a score.
  const scoreProps = usePatternEditorScore(props);
  const { cursor } = scoreProps;
  const { index, hidden } = cursor;

  // The pattern editor passes additional information about the pattern
  const id = pattern?.id;
  const ptId = pattern?.trackId;
  const stream = pattern?.stream ?? [];
  const isCustom = !getValueByKey(PresetPatternMap, id);
  const isEmpty = !stream.length;

  // The pattern editor passes down the current block using the cursor index
  const block = useMemo(
    () => (hidden ? undefined : getPatternBlockAtIndex(stream, index)),
    [stream, index, hidden]
  );
  const onNotes = isPatternChord(block);
  const onRest = !onNotes;
  const chord = useMemo(
    () => (onNotes ? (block as PatternChord) : undefined),
    [block, onNotes]
  );

  // If the block is a chord, resolve the chord to MIDI notes
  const scales = useDeep((_) => selectTrackScaleChain(_, ptId));
  const midiChord = useMemo(
    () => (onNotes ? resolvePatternBlockToMidi(block, scales) : []),
    [block, scales, onNotes]
  );
  const midiNotes = useMemo(
    () => getPatternMidiChordNotes(midiChord as PatternMidiChord),
    [midiChord]
  );
  const isChord = midiNotes.length > 1;

  // There are additional tabs if a chord or note is selected
  const tabs = useMemo(
    () =>
      [
        "Compose",
        "Clock",
        "Bind",
        "Transform",
        isChord ? "Chord" : undefined,
      ].filter(Boolean) as string[],
    [isChord]
  );
  const [tab, setTab] = useState(tabs[0]);

  /** The handler for when the note button/hotkey is clicked. */
  const onBlockClick = useCallback(() => {
    if (!id) return;

    // Change the current chord's duration if it exists or insert a note
    const newBlock = block
      ? updatePatternBlockDuration(block, duration)
      : [{ MIDI: 60, duration, velocity: 100 }];

    // Dispatch the appropriate action
    if (isAdding && hidden) {
      dispatch(addPatternBlock({ id, block: newBlock }));
    }
    if (isAdding && !hidden) {
      dispatch(updatePatternBlock({ id, index, block: newBlock }));
    }
    if (isInserting) {
      dispatch(insertPatternBlock({ id, index, block: newBlock }));
    }
    if (isRemoving) {
      dispatch(removePatternBlock({ id, index }));
    }
  }, [
    id,
    index,
    duration,
    midiNotes,
    hidden,
    isAdding,
    isInserting,
    isRemoving,
  ]);

  /** The handler for when the rest button/hotkey is clicked. */
  const onRestClick = useCallback(() => {
    if (!id) return;
    if (isAdding) {
      if (hidden) {
        dispatch(addPatternBlock({ id, block: { duration } }));
      } else {
        dispatch(updatePatternBlock({ id, index, block: { duration } }));
      }
    }
    if (isInserting && !hidden) {
      dispatch(insertPatternBlock({ id, index, block: { duration } }));
    }
  }, [id, index, duration, hidden, isAdding, isInserting]);

  /** The handler for when the erase button/hotkey is clicked. */
  const onEraseClick = useCallback(() => {
    if (!pattern) return;

    // Use the cursor's index or the last index of the stream
    const index = hidden ? pattern.stream.length - 1 : cursor.index;
    const onLast = cursor.index === pattern.stream.length - 1;

    // Remove the block and rewind the cursor if necessary
    dispatch(removePatternBlock({ id: pattern.id, index }));
    if (onLast) cursor.prev();
  }, [pattern, cursor.index, hidden]);

  // The pattern editor can have a MIDI input selected
  const [midiInput, setMidiInput] = useState<Input>();

  // The pattern editor passes its props down to all of its components.
  const patternEditorProps: PatternEditorProps = {
    ...props,
    ...scoreProps,
    id,
    ptId,
    isCustom,
    isEmpty,
    onRest,
    onNotes,
    isChord,
    block,
    chord,
    midiNotes,
    index,
    tabs,
    tab,
    setTab,
    onBlockClick,
    onRestClick,
    onEraseClick,
    midiInput,
    setMidiInput,
  };
  usePatternEditorHotkeys(patternEditorProps);

  return (
    <EditorContainer id="pattern-editor">
      <EditorBody className="relative">
        <PatternEditorSidebar {...patternEditorProps} />
        <PatternEditorContent {...patternEditorProps} />
      </EditorBody>
      <PatternEditorPiano {...patternEditorProps} />
      <PatternEditorContextMenu {...patternEditorProps} />
    </EditorContainer>
  );
}

export { PatternEditorComponent as PatternEditor };
