import { PatternChord, isPattern, exportPatternToXML } from "types/Pattern";

import { Pattern, PatternId, PatternNote } from "types/Pattern";
import { connect, ConnectedProps } from "react-redux";
import { PatternEditor } from "./components/PatternEditor";
import {
  selectCustomPatterns,
  selectEditor,
  selectPatternIds,
} from "redux/selectors";
import { EditorProps, StateProps } from "..";
import { AppDispatch, Project } from "redux/store";

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
  createPattern,
  deletePattern,
  playPattern,
  exportPatternToMIDI,
  updatePatternByRegex,
} from "redux/Pattern";
import { setTimelineState, updateMediaDraft } from "redux/Timeline";
import { Patterns } from "redux/slices";

const mapStateToProps = (state: Project, ownProps: EditorProps) => {
  const editor = selectEditor(state);
  const pattern = ownProps.selectedPattern;

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

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: EditorProps) => {
  const pattern = ownProps.selectedPattern;
  const id = pattern?.id;
  const setSelectedPattern = (patternId?: PatternId) => {
    if (!patternId) return;
    dispatch(updateMediaDraft({ clip: { patternId } }));
  };
  return {
    createPattern: async () => {
      const id = await dispatch(createPattern());
      setSelectedPattern(id);
    },
    deletePattern: (id: PatternId) => {
      dispatch(deletePattern(id));
    },
    updatePattern: (pattern: Pattern) => {
      dispatch(Patterns.updatePattern(pattern));
    },
    copyPattern: async (_pattern = pattern) => {
      if (!_pattern) return;
      const id = await dispatch(
        createPattern({ ..._pattern, name: `${_pattern.name} (Copy)` })
      );
      if (id) setSelectedPattern(id);
    },
    setSelectedPattern: (id: PatternId) => {
      setSelectedPattern(id);
    },
    setPatternIds: (ids: PatternId[]) => {
      dispatch(Patterns.setPatternIds(ids));
    },
    setPatternName: (pattern?: Pattern, name?: string) => {
      if (!pattern) return;
      dispatch(Patterns.updatePattern({ ...pattern, name }));
    },
    addPatternNote: (patternNote: PatternNote, asChord = false) => {
      if (!id) return;
      dispatch(Patterns.addPatternNote({ id, patternNote, asChord }));
    },
    addPatternChord: (patternChord: PatternChord) => {
      if (!id) return;
      dispatch(Patterns.addPatternChord({ id, patternChord }));
    },
    insertPatternNote: (patternNote: PatternNote, index: number) => {
      if (!id) return;
      dispatch(Patterns.insertPatternNote({ id, patternNote, index }));
    },
    removePatternNote: (index: number) => {
      if (!id) return;
      dispatch(Patterns.removePatternNote({ id, index }));
    },
    updatePatternNote: (
      index: number,
      patternNote: PatternNote,
      asChord = false
    ) => {
      if (!id) return;
      dispatch(Patterns.updatePatternNote({ id, index, patternNote, asChord }));
    },
    updatePatternChord: (index?: number, patternChord?: PatternChord) => {
      if (!id || !patternChord || index === undefined) return;
      dispatch(Patterns.updatePatternChord({ id, index, patternChord }));
    },
    transposePattern: (transpose?: number) => {
      if (!id || transpose == undefined) return;
      dispatch(Patterns.transposePattern({ id, transpose }));
    },
    transposePatternNote: (index?: number, transpose?: number) => {
      if (!pattern || !id) return;
      if (index === undefined || transpose === undefined) return;
      const transposedStream = pattern.stream.map((chord, i) =>
        i === index
          ? chord.map((note) => ({ ...note, MIDI: note.MIDI + transpose }))
          : chord
      );
      dispatch(Patterns.updatePattern({ id, stream: transposedStream }));
    },
    rotatePattern: (transpose?: number) => {
      if (!id || transpose == undefined) return;
      dispatch(Patterns.rotatePattern({ id: pattern.id, transpose }));
    },
    invertPattern: () => {
      if (!id) return;
      dispatch(Patterns.invertPattern(id));
    },
    repeatPattern: (repeat?: number) => {
      if (!id || repeat == undefined) return;
      dispatch(Patterns.repeatPattern({ id, repeat }));
    },
    continuePattern: (length?: number) => {
      if (!id || length == undefined) return;
      dispatch(Patterns.continuePattern({ id, length }));
    },
    phasePattern: (phase?: number) => {
      if (!id || phase == undefined) return;
      dispatch(Patterns.phasePattern({ id, phase }));
    },
    diminishPattern: () => {
      if (!id) return;
      dispatch(Patterns.diminishPattern(id));
    },
    augmentPattern: () => {
      if (!id) return;
      dispatch(Patterns.augmentPattern(id));
    },
    reversePattern: () => {
      if (!id) return;
      dispatch(Patterns.reversePattern(id));
    },
    shufflePattern: () => {
      if (!id) return;
      dispatch(Patterns.shufflePattern(id));
    },
    randomizePattern: (length?: number) => {
      if (!id || length == undefined) return;
      dispatch(Patterns.randomizePattern({ id, length }));
    },
    harmonizePattern: (interval?: number) => {
      if (!id || interval == undefined) return;
      dispatch(Patterns.harmonizePattern({ id, interval }));
    },
    playPattern: (pattern?: Pattern) => {
      dispatch(playPattern(pattern));
    },
    clearPattern: () => {
      if (!id) return;
      dispatch(Patterns.clearPattern(id));
    },
    startAddingPatternAsClip: () => {
      if (!id) return;
      setSelectedPattern(id);
      dispatch(setTimelineState("addingClips"));
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
    onRestClick: (cursor?: OSMDCursor) => {
      if (!pattern || !id || !cursor) return;
      const { index, hidden } = cursor;
      const patternNote = {
        MIDI: MIDI.Rest,
        duration: ownProps.noteTicks,
        velocity: ownProps.noteVelocity,
      };
      if (ownProps.adding) {
        if (hidden) {
          dispatch(Patterns.addPatternNote({ id, patternNote }));
        } else {
          dispatch(Patterns.updatePatternNote({ id, index, patternNote }));
        }
      } else if (ownProps.inserting) {
        if (hidden) {
          dispatch(Patterns.addPatternNote({ id, patternNote }));
        } else {
          dispatch(Patterns.insertPatternNote({ id, index, patternNote }));
        }
      }
    },
    onEraseClick: (cursor?: OSMDCursor) => {
      if (!pattern || !id || !cursor) return;
      if (!pattern.stream.length || cursor.hidden) return;
      const onLast = cursor.index === pattern.stream.length - 1;
      dispatch(Patterns.removePatternNote({ id, index: cursor.index }));
      if (onLast) cursor.prev();
    },
    onDurationClick: (duration: Duration, cursor?: OSMDCursor) => {
      if (!pattern || !id || !cursor) return;
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
      dispatch(Patterns.updatePatternChord({ id, index, patternChord }));
    },
    onTimingClick: (timing: Timing, cursor?: OSMDCursor) => {
      if (!pattern || !id || !cursor) return;
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
      dispatch(Patterns.updatePatternChord({ id, index, patternChord }));
    },
    updatePatternByRegex: (regex?: string) => {
      if (!id || !regex) return;
      dispatch(updatePatternByRegex(id, regex));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface PatternEditorProps extends Props, StateProps {}
export interface PatternEditorCursorProps extends Props, StateProps {
  cursor: OSMDCursor;
}

export default connector(PatternEditor);
