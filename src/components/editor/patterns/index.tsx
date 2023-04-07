import * as Patterns from "redux/slices/patterns";
import PatternsClass from "types/patterns";

import { Note } from "types/units";
import {
  invertPatternStream,
  Pattern,
  PatternId,
  PatternNote,
  transposePatternStream,
} from "types/patterns";
import { connect, ConnectedProps } from "react-redux";
import { EditorPatterns } from "./Patterns";
import {
  hideEditor,
  setActivePattern,
  setTimelineState,
} from "redux/slices/root";
import {
  selectCustomPatterns,
  selectPattern,
  selectPatternIds,
} from "redux/selectors";
import { EditorProps } from "..";
import { AppDispatch, RootState } from "redux/store";
import { UndoTypes } from "redux/undoTypes";
import { ChromaticScale } from "types/presets/scales";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const activePattern = ownProps.activePatternId
    ? selectPattern(state, ownProps.activePatternId)
    : undefined;
  const { past, future } = state.patterns;
  const canUndoPatterns = past.length > 0 && past[0].allIds.length > 0;
  const canRedoPatterns = future.length > 0;
  const patternIds = selectPatternIds(state);
  const customPatterns = selectCustomPatterns(state);

  const scale = ChromaticScale;
  return {
    ...ownProps,
    activePattern,
    patternIds,
    customPatterns,
    canUndoPatterns,
    canRedoPatterns,
    scale,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  // Patterns
  createPattern: (pattern?: Pattern) => {
    dispatch(Patterns.createPattern({ ...pattern }));
  },
  deletePattern: (id: PatternId) => {
    dispatch(Patterns.deletePattern(id));
  },
  updatePattern: (pattern: Pattern) => {
    dispatch(Patterns.updatePattern(pattern));
  },
  copyPatternPreset: async (pattern: Pattern) => {
    const patternId = await dispatch(
      Patterns.createPattern({ ...pattern, name: pattern.name })
    );
    dispatch(setActivePattern(patternId));
  },
  setPatternId: (id: PatternId) => {
    dispatch(setActivePattern(id));
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
  transposePattern: (pattern: Pattern, transpose: Note) => {
    dispatch(Patterns.transposePattern({ id: pattern.id, transpose }));
  },
  invertPattern: (pattern: Pattern, transpose: Note) => {
    dispatch(Patterns.invertPattern({ id: pattern.id, transpose }));
  },
  repeatPattern: (pattern: Pattern) => {
    dispatch(Patterns.repeatPattern(pattern.id));
  },
  halvePattern: (pattern: Pattern) => {
    dispatch(Patterns.halvePattern(pattern.id));
  },
  stretchPattern: (pattern: Pattern) => {
    dispatch(Patterns.stretchPattern(pattern.id));
  },
  shrinkPattern: (pattern: Pattern) => {
    dispatch(Patterns.shrinkPattern(pattern.id));
  },
  shufflePattern: (pattern: Pattern) => {
    dispatch(Patterns.shufflePattern(pattern.id));
  },
  randomizePattern: (pattern: Pattern) => {
    dispatch(Patterns.randomizePattern(pattern.id));
  },
  randomTransposePattern: (pattern: Pattern) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const random_T = Math.abs(Math.floor(Math.random() * 6) - 3) * direction;
    const random_t = Math.abs(Math.floor(Math.random() * 6) - 3) * -direction;
    const stream = pattern.stream;
    const transposedStream = transposePatternStream(stream, random_T);
    dispatch(
      Patterns.updatePattern({
        id: pattern.id,
        stream: invertPatternStream(transposedStream, random_t),
      })
    );
  },
  playPattern: (id: PatternId) => {
    dispatch(Patterns.playPattern(id));
  },
  clearPattern: (pattern: Pattern) => {
    dispatch(Patterns.clearPattern(pattern.id));
  },
  startAddingPatternAsClip: (pattern: Pattern) => {
    dispatch(setActivePattern(pattern.id));
    dispatch(setTimelineState("adding"));
    dispatch(hideEditor());
  },
  exportPattern: (pattern: Pattern) => {
    const xml = PatternsClass.serialize(pattern, ChromaticScale);
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
  undoPatterns: () => {
    dispatch({ type: UndoTypes.undoPatterns });
  },
  redoPatterns: () => {
    dispatch({ type: UndoTypes.redoPatterns });
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorPatternsProps extends Props {}

export default connector(EditorPatterns);
