import * as _ from "redux/Pattern";
import { Editor } from "features/Editor/components";
import { PatternEditor as PatternEditor } from "./components";
import { useCallback, useState } from "react";
import { ScoreProps } from "lib/opensheetmusicdisplay";
import { usePatternEditorHotkeys } from "./hooks/usePatternEditorHotkeys";
import { useProjectDeepSelector, useProjectSelector } from "redux/hooks";
import { PresetPatternMap } from "presets/patterns";
import { EditorProps } from "features/Editor/Editor";
import { usePatternEditorScore } from "./hooks/usePatternEditorScore";
import { UndoTypes } from "redux/undoTypes";
import {
  PatternBlock,
  PatternMidiChord,
  getPatternBlockAtIndex,
  isPatternChord,
  resolvePatternChordToMidi as resolveMidiChord,
} from "types/Pattern";
import { Input } from "webmidi";
import { getDurationTicks } from "utils/durations";
import { usePatternEditorDefaultPattern } from "./hooks/usePatternEditorDefaultPattern";
import { selectTrackScaleChain } from "redux/Track";

/** The pattern editor uses the pattern history and a score. */
export interface PatternEditorProps extends EditorProps, ScoreProps {
  // The pattern editor passes additional information about the pattern
  isCustom: boolean;
  isEmpty: boolean;

  // The pattern editor uses the cursor to pass down the current block
  onRest: boolean;
  onChord: boolean;
  block?: PatternBlock;
  chord?: PatternMidiChord;

  // The pattern editor has specific score callbacks
  onBlockClick: () => void;
  onRestClick: () => void;
  onEraseClick: () => void;

  // The pattern editor can have a MIDI input selected
  midiInput?: Input;
  setMidiInput: (input: Input) => void;

  // The pattern editor uses the pattern history
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

function PatternEditorComponent(props: EditorProps) {
  const { dispatch, pattern, isAdding, isInserting, isRemoving } = props;

  // The pattern editor uses a score.
  const scoreProps = usePatternEditorScore(props);
  const { cursor } = scoreProps;
  const { index, hidden } = cursor;

  // The pattern editor passes additional information about the pattern
  const id = pattern?.id;
  const isCustom = !PresetPatternMap[pattern?.id ?? ""];
  const isEmpty = !pattern?.stream?.length;
  const duration = getDurationTicks(props.settings.note.duration);

  // The pattern editor uses the cursor to pass down the current block
  const ptId = pattern?.patternTrackId;
  const scales = useProjectDeepSelector((_) => selectTrackScaleChain(_, ptId));
  const block = hidden
    ? undefined
    : getPatternBlockAtIndex(pattern?.stream ?? [], index);
  const onRest = !isPatternChord(block);
  const chord = !block || onRest ? undefined : resolveMidiChord(block, scales);
  const onChord = !!chord?.length;

  /** The handler for when the note button/hotkey is clicked. */
  const onBlockClick = useCallback(() => {
    if (!id) return;

    // Change the current chord's duration if it exists or insert a note
    const block = chord?.length
      ? chord.map((note) => ({ ...note, duration }))
      : [{ MIDI: 60, duration, velocity: 100 }];

    // Dispatch the appropriate action
    if (isAdding && hidden) {
      dispatch(_.addPatternBlock({ id, block }));
    }
    if (isAdding && !hidden) {
      dispatch(_.updatePatternBlock({ id, index, block }));
    }
    if (isInserting) {
      dispatch(_.insertPatternBlock({ id, index, block }));
    }
    if (isRemoving) {
      dispatch(_.removePatternBlock({ id, index }));
    }
  }, [id, index, duration, chord, hidden, isAdding, isInserting, isRemoving]);

  /** The handler for when the rest button/hotkey is clicked. */
  const onRestClick = useCallback(() => {
    if (!id) return;
    if (isAdding) {
      if (hidden) {
        dispatch(_.addPatternBlock({ id, block: { duration } }));
      } else {
        dispatch(_.updatePatternBlock({ id, index, block: { duration } }));
      }
    }
    if (isInserting && !hidden) {
      dispatch(_.insertPatternBlock({ id, index, block: { duration } }));
    }
  }, [id, index, hidden, isAdding, isInserting]);

  /** The handler for when the erase button/hotkey is clicked. */
  const onEraseClick = useCallback(() => {
    if (!pattern) return;

    // Use the cursor's index or the last index of the stream
    const index = hidden ? pattern.stream.length - 1 : cursor.index;
    const onLast = cursor.index === pattern.stream.length - 1;

    // Remove the block and rewind the cursor if necessary
    dispatch(_.removePatternBlock({ id: pattern.id, index }));
    if (onLast) cursor.prev();
  }, [pattern, cursor.index, hidden]);

  // The pattern editor can have a MIDI input selected
  const [midiInput, setMidiInput] = useState<Input>();

  // The pattern editor uses the pattern history
  const canUndo = !!useProjectSelector(_.selectPatternPastLength) && isCustom;
  const canRedo = !!useProjectSelector(_.selectPatternFutureLength) && isCustom;
  const undo = useCallback(
    () => dispatch({ type: UndoTypes.undoPatterns }),
    []
  );
  const redo = useCallback(
    () => dispatch({ type: UndoTypes.redoPatterns }),
    []
  );

  // The pattern editor passes its props down to all of its components.
  const patternEditorProps: PatternEditorProps = {
    ...props,
    ...scoreProps,
    isCustom,
    isEmpty,
    onRest,
    onChord,
    block,
    chord,
    onBlockClick,
    onRestClick,
    onEraseClick,
    midiInput,
    setMidiInput,
    canUndo,
    canRedo,
    undo,
    redo,
  };
  usePatternEditorDefaultPattern(patternEditorProps);
  usePatternEditorHotkeys(patternEditorProps);

  return (
    <Editor.Container id="pattern-editor">
      <Editor.Body className="relative">
        <PatternEditor.Sidebar {...patternEditorProps} />
        <PatternEditor.Content {...patternEditorProps} />
      </Editor.Body>
      <PatternEditor.Piano {...patternEditorProps} />
      <PatternEditor.ContextMenu {...patternEditorProps} />
    </Editor.Container>
  );
}

export { PatternEditorComponent as PatternEditor };
