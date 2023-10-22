import * as Scales from "redux/Scale";
import { Note } from "types/units";
import { connect, ConnectedProps } from "react-redux";
import {
  exportScaleToXML,
  getScaleCategory,
  getScaleName,
  Scale,
  ScaleId,
  ScaleObject,
  NestedScaleNoId,
  NestedScaleObject,
} from "types/Scale";
import { ScaleEditor } from "./components/ScaleEditor";
import { EditorProps } from "..";
import {
  selectScaleIds,
  selectScaleTrackMap,
  selectSelectedTrack,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { Dispatch, Project } from "types/Project";
import { StateProps } from "../components/Editor";
import {
  createScale,
  deleteScale,
  exportScaleToMIDI,
  playScale,
} from "redux/Scale";
import { getScaleTrackScale, ScaleTrack } from "types/ScaleTrack";
import {
  addNoteToScaleTrack,
  clearNotesFromScale,
  removeNoteFromScaleTrack,
  rotateScale,
  transposeScale,
} from "redux/thunks";
import { updateScaleTrack } from "redux/ScaleTrack";
import { getProperty } from "types/util";

const mapStateToProps = (project: Project, ownProps: EditorProps) => {
  const scaleTrack = selectSelectedTrack(project) as ScaleTrack;
  const scaleTracks = selectScaleTrackMap(project);
  const scaleMap = Scales.selectScaleMap(project);
  const scale = getScaleTrackScale(scaleTrack, scaleTracks, scaleMap);
  const nestedScale = getProperty(scaleMap, scaleTrack.scaleId);

  const { past, future } = project.scales;
  const canUndoScales = past.length > 0 && past[0].allIds.length > 0;
  const canRedoScales = future.length > 0;

  const scaleIds = selectScaleIds(project);
  const customScales = Scales.selectCustomScales(project);

  // Get the name and category from any matching scale
  const scaleName = getScaleName(scale);
  const scaleCategory = getScaleCategory(scale);
  const scalePartial: Partial<NestedScaleNoId> = !!nestedScale
    ? { ...nestedScale, name: scaleName }
    : {};

  return {
    ...ownProps,
    scale,
    nestedScale,
    scaleTrack,
    scaleName,
    scaleCategory,
    canUndoScales,
    canRedoScales,
    scaleIds,
    customScales,
    scalePartial,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: EditorProps) => {
  const track = ownProps.selectedTrack as ScaleTrack;
  const id = track?.id;
  const scaleId = track?.scaleId;
  return {
    // Scales
    setScaleIds: (ids: ScaleId[]) => {
      dispatch(Scales.setScaleIds(ids));
    },
    updateScaleTrack: (scaleTrack: Partial<ScaleTrack>) => {
      dispatch(updateScaleTrack(scaleTrack));
    },
    updateScale: (scale: Partial<NestedScaleObject>) => {
      if (!scaleId) return;
      dispatch(Scales.updateScale({ id: scaleId, ...scale }));
    },
    setScaleName: (scale: ScaleObject, name: string) => {
      dispatch(Scales.updateScale({ id: scale.id, name }));
    },
    addNoteToScaleTrack: (note: Note) => {
      if (!id) return;
      dispatch(addNoteToScaleTrack(id, note));
    },
    removeNoteFromScaleTrack: (note: Note) => {
      if (!id) return;
      dispatch(removeNoteFromScaleTrack(id, note));
    },
    transposeScaleTrack: (offset: number) => {
      if (!scaleId || offset === undefined) return;
      dispatch(transposeScale(scaleId, offset));
    },
    rotateScaleTrack: (offset: number) => {
      if (!scaleId || offset === undefined) return;
      dispatch(rotateScale(scaleId, offset));
    },
    exportScaleToXML: (scale: Scale) => {
      const xml = exportScaleToXML(scale);
      if (!xml) return;
      const blob = new Blob([xml], { type: "text/musicxml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = getScaleName(scale);
      link.download = `${name}.musicxml`;
      document.body.appendChild(link);
      link.href = url;
      link.click();
      document.body.removeChild(link);
    },
    exportScaleToMIDI: (scale: Scale) => {
      dispatch(exportScaleToMIDI(scale));
    },
    clearScaleTrack: () => {
      if (!scaleId) return;
      dispatch(clearNotesFromScale(scaleId));
    },
    createScale: (scale: Partial<NestedScaleNoId>) => {
      return dispatch(
        createScale({
          name: scale.name ?? "New Scale",
          notes: scale.notes,
        })
      );
    },
    deleteScale: (id?: ScaleId) => {
      if (!id) return;
      dispatch(deleteScale(id));
    },
    playScale: (scale: Scale) => {
      dispatch(playScale(scale));
    },
    undoScales: () => {
      dispatch({ type: UndoTypes.undoScales });
    },
    redoScales: () => {
      dispatch({ type: UndoTypes.redoScales });
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface ScaleEditorProps extends Props, StateProps {}

export default connector(ScaleEditor);
