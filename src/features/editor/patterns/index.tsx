import { PatternChord, isPattern, exportPatternToXML } from "types/Pattern";

import { Pattern, PatternId, PatternNote } from "types/Pattern";
import { connect, ConnectedProps } from "react-redux";
import { PatternEditor } from "./components/PatternEditor";
import {
  selectCustomPatterns,
  selectEditor,
  selectPatternById,
  selectPatternIds,
} from "redux/selectors";
import { EditorProps, StateProps } from "..";
import { AppDispatch, RootState } from "redux/store";

import { UndoTypes } from "redux/undoTypes";
import { OSMDCursor } from "lib/opensheetmusicdisplay";
import { MIDI } from "types/midi";
import { Duration, Timing } from "types/units";
import { durationToTicks } from "utils";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "presets/patterns";
import { hideEditor } from "redux/Editor";
import {
  createPatterns,
  deletePatterns,
  playPattern,
  exportPatternToMIDI,
  updatePatternByRegex,
} from "redux/Pattern";
import { setSelectedPattern } from "redux/Root";
import { setTimelineState } from "redux/Timeline";
import { Patterns } from "redux/slices";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const editor = selectEditor(state);

  const pattern = ownProps.selectedPatternId
    ? selectPatternById(state, ownProps.selectedPatternId)
    : undefined;
  const { past, future } = state.patterns;
  const canUndoPatterns = past.length > 0 && past[0].allIds.length > 0;
  const canRedoPatterns = future.length > 0;
  const patternIds = selectPatternIds(state);
  const customPatterns = selectCustomPatterns(state);

  const patternCategory =
    PresetPatternGroupList.find((c) =>
      PresetPatternGroupMap[c].some((m) => m.id === pattern?.id)
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
    customPatterns,
    canUndoPatterns,
    canRedoPatterns,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: EditorProps) => ({
  // Patterns
  createPatterns: (patterns?: Partial<Pattern>[]) => {
    return dispatch(createPatterns(patterns));
  },
  deletePatterns: (ids: PatternId[]) => {
    dispatch(deletePatterns(ids));
  },
  updatePatterns: (patterns: Pattern[]) => {
    dispatch(Patterns.updatePatterns(patterns));
  },
  copyPattern: async (pattern?: Pattern) => {
    if (!pattern || !isPattern(pattern)) return;
    const patternIds = await dispatch(
      createPatterns([{ ...pattern, name: `${pattern.name} (Copy)` }])
    );
    dispatch(setSelectedPattern(patternIds?.[0]));
  },
  setPatternId: (id: PatternId) => {
    dispatch(setSelectedPattern(id));
  },
  setPatternIds: (ids: PatternId[]) => {
    dispatch(Patterns.setPatternIds(ids));
  },
  setPatternName: (pattern?: Pattern, name?: string) => {
    if (!pattern || !isPattern(pattern)) return;
    dispatch(Patterns.updatePatterns([{ id: pattern.id, name }]));
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
    if (pattern === undefined || !isPattern(pattern)) return;
    if (index === undefined || patternChord === undefined) return;
    dispatch(
      Patterns.updatePatternChord({
        id: pattern.id,
        index,
        patternChord,
      })
    );
  },
  transposePattern: (pattern?: Pattern, transpose?: number) => {
    if (pattern === undefined || transpose == undefined) return;
    dispatch(Patterns.transposePattern({ id: pattern.id, transpose }));
  },
  transposePatternNote: (
    pattern?: Pattern,
    index?: number,
    transpose?: number
  ) => {
    if (pattern === undefined || !isPattern(pattern)) return;
    if (index === undefined || transpose === undefined) return;
    const transposedStream = pattern.stream.map((chord, i) => {
      if (i !== index) return chord;
      return chord.map((note) => {
        if (!note) return note;
        return { ...note, MIDI: note.MIDI + transpose };
      });
    });
    dispatch(
      Patterns.updatePatterns([
        {
          id: pattern.id,
          stream: transposedStream,
        },
      ])
    );
  },
  rotatePattern: (pattern?: Pattern, transpose?: number) => {
    if (pattern === undefined || transpose == undefined) return;
    dispatch(Patterns.rotatePattern({ id: pattern.id, transpose }));
  },
  invertPattern: (pattern?: Pattern) => {
    if (pattern === undefined) return;
    dispatch(Patterns.invertPattern(pattern.id));
  },
  repeatPattern: (pattern?: Pattern, repeat?: number) => {
    if (pattern === undefined || repeat == undefined) return;
    dispatch(Patterns.repeatPattern({ id: pattern.id, repeat }));
  },
  continuePattern: (pattern?: Pattern, length?: number) => {
    if (pattern === undefined || length == undefined) return;
    dispatch(Patterns.continuePattern({ id: pattern.id, length }));
  },
  phasePattern: (pattern?: Pattern, phase?: number) => {
    if (pattern === undefined || phase == undefined) return;
    dispatch(Patterns.phasePattern({ id: pattern.id, phase }));
  },
  diminishPattern: (pattern?: Pattern) => {
    if (pattern === undefined) return;
    dispatch(Patterns.diminishPattern(pattern.id));
  },
  augmentPattern: (pattern?: Pattern) => {
    if (pattern === undefined) return;
    dispatch(Patterns.augmentPattern(pattern.id));
  },
  reversePattern: (pattern?: Pattern) => {
    if (!pattern || !isPattern(pattern)) return;
    dispatch(Patterns.reversePattern(pattern.id));
  },
  shufflePattern: (pattern?: Pattern) => {
    if (pattern === undefined) return;
    dispatch(Patterns.shufflePattern(pattern.id));
  },
  randomizePattern: (pattern?: Pattern, length?: number) => {
    if (pattern === undefined || length == undefined) return;
    dispatch(Patterns.randomizePattern({ id: pattern.id, length }));
  },
  harmonizePattern: (pattern?: Pattern, interval?: number) => {
    if (pattern === undefined || interval == undefined) return;
    dispatch(Patterns.harmonizePattern({ id: pattern.id, interval }));
  },
  playPattern: (pattern: Pattern) => {
    dispatch(playPattern(pattern));
  },
  clearPattern: (pattern?: Pattern) => {
    if (!pattern || !isPattern(pattern)) return;
    dispatch(Patterns.clearPattern(pattern.id));
  },
  startAddingPatternAsClip: (pattern?: Pattern) => {
    if (!pattern || !isPattern(pattern)) return;
    dispatch(setSelectedPattern(pattern.id));
    dispatch(setTimelineState("adding"));
    dispatch(hideEditor());
  },
  exportPatternToXML: (pattern?: Pattern) => {
    if (!pattern || !isPattern(pattern)) return;
    const xml = exportPatternToXML(pattern);
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
    if (!pattern || !isPattern(pattern)) return;
    dispatch(exportPatternToMIDI(pattern.id));
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
      velocity: ownProps.noteVelocity,
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
        dispatch(Patterns.addPatternNote({ id: pattern.id, patternNote }));
      } else {
        dispatch(
          Patterns.insertPatternNote({
            id: pattern.id,
            index: cursor.index,
            patternNote,
          })
        );
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
  updatePatternByRegex: (pattern?: Pattern, regex?: string) => {
    if (!pattern || !regex) return;
    dispatch(updatePatternByRegex(pattern.id, regex));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface PatternEditorProps extends Props, StateProps {}
export interface PatternEditorCursorProps extends Props, StateProps {
  cursor: OSMDCursor;
}

export default connector(PatternEditor);
