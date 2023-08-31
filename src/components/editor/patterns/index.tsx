import * as Patterns from "redux/slices/patterns";
import PatternsClass from "types/patterns";

import { Pattern, PatternId, PatternNote } from "types/patterns";
import { connect, ConnectedProps } from "react-redux";
import { PatternEditor } from "./PatternEditor";
import {
  hideEditor,
  setSelectedPattern,
  setTimelineState,
} from "redux/slices/root";
import {
  selectCustomPatterns,
  selectPattern,
  selectPatternIds,
} from "redux/selectors";
import { EditorProps } from "..";
import { AppDispatch, RootState } from "redux/store";
import { ChromaticScale } from "types/presets/scales";
import { StateProps } from "../Editor";
import { playPattern } from "redux/thunks/patterns";
import { UndoTypes } from "redux/undoTypes";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
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

  const isPatternEmpty = !pattern?.stream.length;
  const isPatternCustom = customPatterns.some((m) => m.id === pattern?.id);

  return {
    ...ownProps,
    pattern,
    patternCategory,
    patternIds,
    isPatternEmpty,
    isPatternCustom,
    scale,
    customPatterns,
    canUndoPatterns,
    canRedoPatterns,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  // Patterns
  createPattern: (pattern?: Pattern) => {
    return dispatch(Patterns.createPattern({ ...pattern }));
  },
  deletePattern: (id: PatternId) => {
    dispatch(Patterns.deletePattern(id));
  },
  updatePattern: (pattern: Pattern) => {
    dispatch(Patterns.updatePattern(pattern));
  },
  copyPattern: async (pattern: Pattern) => {
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
  setPatternName: (pattern: Pattern, name: string) => {
    dispatch(Patterns.updatePattern({ id: pattern.id, name }));
  },
  addPatternNote: (
    id: PatternId,
    patternNote: PatternNote,
    asChord = false
  ) => {
    dispatch(Patterns.addPatternNote({ id, patternNote, asChord }));
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
  transposePattern: (pattern: Pattern, transpose: number) => {
    dispatch(Patterns.transposePattern({ id: pattern.id, transpose }));
  },
  transposePatternNote: (
    pattern: Pattern,
    index: number,
    transpose: number
  ) => {
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
  rotatePattern: (pattern: Pattern, transpose: number) => {
    dispatch(Patterns.rotatePattern({ id: pattern.id, transpose }));
  },
  repeatPattern: (pattern: Pattern, repeat: number) => {
    dispatch(Patterns.repeatPattern({ id: pattern.id, repeat }));
  },
  halvePattern: (pattern: Pattern) => {
    dispatch(Patterns.halvePattern(pattern.id));
  },
  lengthenPattern: (pattern: Pattern, length: number) => {
    dispatch(Patterns.lengthenPattern({ id: pattern.id, length }));
  },
  augmentPattern: (pattern: Pattern) => {
    dispatch(Patterns.augmentPattern(pattern.id));
  },
  diminishPattern: (pattern: Pattern) => {
    dispatch(Patterns.diminishPattern(pattern.id));
  },
  shufflePattern: (pattern: Pattern) => {
    dispatch(Patterns.shufflePattern(pattern.id));
  },
  randomizePattern: (pattern: Pattern, length: number) => {
    dispatch(Patterns.randomizePattern({ id: pattern.id, length }));
  },
  reversePattern: (pattern: Pattern) => {
    dispatch(Patterns.reversePattern(pattern.id));
  },
  phasePattern: (id: PatternId, phase: number) => {
    dispatch(Patterns.phasePattern({ id, phase }));
  },
  playPattern: (id: PatternId) => {
    dispatch(playPattern(id));
  },
  clearPattern: (pattern: Pattern) => {
    dispatch(Patterns.clearPattern(pattern.id));
  },
  startAddingPatternAsClip: (pattern: Pattern) => {
    dispatch(setSelectedPattern(pattern.id));
    dispatch(setTimelineState("adding"));
    dispatch(hideEditor());
  },
  exportPatternToXML: (pattern: Pattern) => {
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
  exportPatternToMIDI: (pattern: Pattern) => {
    PatternsClass.exportToMIDI(pattern);
  },
  undoPatterns: () => {
    dispatch({ type: UndoTypes.undoPatterns });
  },
  redoPatterns: () => {
    dispatch({ type: UndoTypes.redoPatterns });
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface PatternEditorProps extends Props, StateProps {}

export default connector(PatternEditor);
