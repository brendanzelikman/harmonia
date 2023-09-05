import * as Patterns from "redux/slices/patterns";
import PatternsClass, { PatternChord, isPatternValid } from "types/patterns";

import { Pattern, PatternId, PatternNote } from "types/patterns";
import { connect, ConnectedProps } from "react-redux";
import { PatternEditor } from "./PatternEditor";
import { setSelectedPattern } from "redux/slices/root";
import {
  selectCustomPatterns,
  selectEditor,
  selectPattern,
  selectPatternIds,
} from "redux/selectors";
import { EditorProps } from "..";
import { AppDispatch, RootState } from "redux/store";
import { ChromaticScale } from "types/presets/scales";
import { StateProps } from "../Editor";
import { playPattern } from "redux/thunks/patterns";
import { UndoTypes } from "redux/undoTypes";
import { hideEditor } from "redux/slices/editor";
import { setTimelineState } from "redux/slices/timeline";
import { OSMDCursor } from "lib/opensheetmusicdisplay";
import { MIDI } from "types/midi";
import { Duration, Timing } from "types/units";
import { durationToTicks } from "appUtil";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const editor = selectEditor(state);

  const pattern = ownProps.selectedPatternId
    ? selectPattern(state, ownProps.selectedPatternId)
    : undefined;
  const { past, future } = state.patterns;
  const canUndoPatterns = past.length > 0 && past[0].allIds.length > 0;
  const canRedoPatterns = future.length > 0;
  const patternIds = selectPatternIds(state);
  const customPatterns = selectCustomPatterns(state);
  const scale = ChromaticScale;

  const patternCategory =
    PatternsClass.PresetCategories.find((c) =>
      PatternsClass.PresetGroups[c].some((m) => m.id === pattern?.id)
    ) ?? "Custom Patterns";

  const isEmpty = !pattern?.stream.length;
  const isCustom = customPatterns.some((m) => m.id === pattern?.id);

  return {
    ...ownProps,
    ...editor,
    pattern,
    patternCategory,
    patternIds,
    isEmpty,
    isCustom,
    scale,
    customPatterns,
    canUndoPatterns,
    canRedoPatterns,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: EditorProps) => ({
  // Patterns
  createPattern: (pattern?: Pattern) => {
    return dispatch(Patterns.createPattern({ ...pattern }));
  },
  deletePattern: (id: PatternId) => {
    dispatch(Patterns.deletePattern(id));
  },
  updatePattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.updatePattern(pattern));
  },
  copyPattern: async (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    const patternId = await dispatch(
      Patterns.createPattern({ ...pattern, name: `${pattern.name} (Copy)` })
    );
    dispatch(setSelectedPattern(patternId));
  },
  setPatternId: (id: PatternId) => {
    dispatch(setSelectedPattern(id));
  },
  setPatternIds: (ids: PatternId[]) => {
    dispatch(Patterns.setPatternIds(ids));
  },
  setPatternName: (pattern?: Pattern, name?: string) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.updatePattern({ id: pattern.id, name }));
  },
  addPatternNote: (
    id: PatternId,
    patternNote: PatternNote,
    asChord = false
  ) => {
    dispatch(Patterns.addPatternNote({ id, patternNote, asChord }));
  },
  addPatternChord: (id: PatternId, patternChord: PatternChord) => {
    dispatch(Patterns.addPatternChord({ id, patternChord }));
  },
  insertPatternNote: (
    id: PatternId,
    patternNote: PatternNote,
    index: number
  ) => {
    dispatch(Patterns.insertPatternNote({ id, patternNote, index }));
  },
  removePatternNote: (id: PatternId, index: number) => {
    dispatch(Patterns.removePatternNote({ id, index }));
  },
  updatePatternNote: (
    id: PatternId,
    index: number,
    patternNote: PatternNote,
    asChord = false
  ) => {
    dispatch(
      Patterns.updatePatternNote({
        id,
        index,
        patternNote,
        asChord,
      })
    );
  },
  updatePatternChord: (
    pattern?: Pattern,
    index?: number,
    patternChord?: PatternChord
  ) => {
    if (!pattern || !index || !patternChord || !isPatternValid(pattern)) return;
    dispatch(
      Patterns.updatePatternChord({
        id: pattern.id,
        index,
        patternChord,
      })
    );
  },
  transposePattern: (pattern?: Pattern, transpose?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.transposePattern({ id: pattern.id, transpose }));
  },
  transposePatternNote: (
    pattern: Pattern,
    index: number,
    transpose: number
  ) => {
    if (!pattern || !isPatternValid(pattern)) return;
    const transposedStream = pattern.stream.map((chord, i) => {
      if (i !== index) return chord;
      return chord.map((note) => {
        if (!note) return note;
        return { ...note, MIDI: note.MIDI + transpose };
      });
    });
    dispatch(
      Patterns.updatePattern({
        id: pattern.id,
        stream: transposedStream,
      })
    );
  },
  rotatePattern: (pattern?: Pattern, transpose?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.rotatePattern({ id: pattern.id, transpose }));
  },
  repeatPattern: (pattern?: Pattern, repeat?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.repeatPattern({ id: pattern.id, repeat }));
  },
  halvePattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.halvePattern(pattern.id));
  },
  lengthenPattern: (pattern?: Pattern, length?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.lengthenPattern({ id: pattern.id, length }));
  },
  augmentPattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.augmentPattern(pattern.id));
  },
  diminishPattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.diminishPattern(pattern.id));
  },
  shufflePattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.shufflePattern(pattern.id));
  },
  randomizePattern: (pattern?: Pattern, length?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.randomizePattern({ id: pattern.id, length }));
  },
  reversePattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.reversePattern(pattern.id));
  },
  phasePattern: (pattern?: Pattern, phase?: number) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.phasePattern({ id: pattern.id, phase }));
  },
  playPattern: (id: PatternId) => {
    dispatch(playPattern(id));
  },
  clearPattern: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(Patterns.clearPattern(pattern.id));
  },
  startAddingPatternAsClip: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    dispatch(setSelectedPattern(pattern.id));
    dispatch(setTimelineState("adding"));
    dispatch(hideEditor());
  },
  exportPatternToXML: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    const xml = PatternsClass.exportToXML(pattern, ChromaticScale);
    if (!xml) return;
    const blob = new Blob([xml], { type: "text/musicxml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${pattern.name}.musicxml`;
    document.body.appendChild(link);
    link.href = url;
    link.click();
    document.body.removeChild(link);
  },
  exportPatternToMIDI: (pattern?: Pattern) => {
    if (!pattern || !isPatternValid(pattern)) return;
    PatternsClass.exportToMIDI(pattern);
  },
  undoPatterns: () => {
    dispatch({ type: UndoTypes.undoPatterns });
  },
  redoPatterns: () => {
    dispatch({ type: UndoTypes.redoPatterns });
  },
  onRestClick: (pattern?: Pattern, cursor?: OSMDCursor) => {
    if (!pattern || !cursor) return;
    const patternNote = {
      MIDI: MIDI.Rest,
      duration: ownProps.noteTicks,
    };
    if (ownProps.adding) {
      if (cursor.hidden) {
        dispatch(Patterns.addPatternNote({ id: pattern.id, patternNote }));
      } else {
        dispatch(
          Patterns.updatePatternNote({
            id: pattern.id,
            index: cursor.index,
            patternNote,
          })
        );
      }
    } else if (ownProps.inserting) {
      if (cursor.hidden) {
        Patterns.addPatternNote({ id: pattern.id, patternNote });
      } else {
        Patterns.insertPatternNote({
          id: pattern.id,
          index: cursor.index,
          patternNote,
        });
      }
    }
  },
  onEraseClick: (pattern?: Pattern, cursor?: OSMDCursor) => {
    if (!pattern || !cursor) return;
    if (!pattern.stream.length || cursor.hidden) return;
    const onLast = cursor.index === pattern.stream.length - 1;
    dispatch(
      Patterns.removePatternNote({ id: pattern.id, index: cursor.index })
    );
    if (onLast) cursor.prev();
  },
  onDurationClick: (
    duration: Duration,
    pattern?: Pattern,
    cursor?: OSMDCursor
  ) => {
    if (!pattern || !cursor) return;
    ownProps.setNoteDuration(duration);

    if (cursor.hidden) return;
    const index = cursor.index;
    const chord = pattern.stream[index];
    const patternChord = chord.map((c) => {
      return {
        ...c,
        duration: durationToTicks(duration, {
          dotted: ownProps.noteTiming === "dotted",
          triplet: ownProps.noteTiming === "triplet",
        }),
      };
    });
    dispatch(
      Patterns.updatePatternChord({
        id: pattern.id,
        index,
        patternChord,
      })
    );
  },
  onTimingClick: (timing: Timing, pattern?: Pattern, cursor?: OSMDCursor) => {
    if (!pattern || !cursor) return;
    ownProps.setNoteTiming(timing);

    if (cursor.hidden) return;

    const index = cursor.index;
    const chord = pattern.stream[index];
    const patternChord = chord.map((c) => ({
      ...c,
      duration: durationToTicks(ownProps.noteDuration, {
        dotted: timing === "dotted",
        triplet: timing === "triplet",
      }),
    }));
    dispatch(
      Patterns.updatePatternChord({ id: pattern.id, index, patternChord })
    );
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface PatternEditorProps extends Props, StateProps {}
export interface PatternEditorCursorProps extends Props, StateProps {
  cursor: OSMDCursor;
}

export default connector(PatternEditor);
