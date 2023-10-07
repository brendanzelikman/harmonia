import * as Scales from "redux/Scale";
import { Note } from "types/units";
import { connect, ConnectedProps } from "react-redux";
import {
  exportScaleToXML,
  getScaleCategory,
  getScaleName,
  Scale,
  ScaleId,
  ScaleNoId,
  ScaleObject,
  unpackScale,
} from "types/Scale";
import { ScaleEditor } from "./components/ScaleEditor";
import { EditorProps } from "..";
import {
  selectSelectedTrackId,
  selectCustomScales,
  selectScaleIds,
  selectScaleTrackById,
  selectScaleTrackMap,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { RootState } from "redux/store";
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
  clearNotesFromScaleTrack,
  removeNoteFromScaleTrack,
  rotateScaleTrack,
  transposeScaleTrack,
} from "redux/thunks";
import { updateScaleTrack } from "redux/ScaleTrack";
import { TrackId } from "types/Track";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectSelectedTrackId(state);
  const scaleTrack = trackId ? selectScaleTrackById(state, trackId) : undefined;
  const scaleTracks = selectScaleTrackMap(state);

  const scale = getScaleTrackScale(scaleTrack, scaleTracks);

  const { past, future } = state.scales;
  const canUndoScales = past.length > 0 && past[0].allIds.length > 0;
  const canRedoScales = future.length > 0;

  const scaleIds = selectScaleIds(state);
  const customScales = selectCustomScales(state);

  // Get the category from any matching scale
  const scaleName = getScaleName(scale);
  const scaleNotes = unpackScale(scale);
  const scaleCategory = getScaleCategory(scale);
  const scalePartial = { notes: scaleNotes, name: scaleName };

  return {
    ...ownProps,
    scale,
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

const mapDispatchToProps = (dispatch: any) => ({
  // Scales
  setScaleIds: (ids: ScaleId[]) => {
    dispatch(Scales.setScaleIds(ids));
  },
  updateScaleTrack: (scaleTrack: Partial<ScaleTrack>) => {
    dispatch(updateScaleTrack(scaleTrack));
  },
  setScaleName: (scale: ScaleObject, name: string) => {
    dispatch(Scales.updateScale({ id: scale.id, name }));
  },
  addNoteToScaleTrack: (id: TrackId, note: Note) => {
    dispatch(addNoteToScaleTrack(id, note));
  },
  removeNoteFromScaleTrack: (id: TrackId, note: Note) => {
    dispatch(removeNoteFromScaleTrack(id, note));
  },
  transposeScaleTrack: (id: TrackId, offset: number) => {
    if (offset === 0 || isNaN(offset)) return;
    dispatch(transposeScaleTrack(id, offset));
  },
  rotateScaleTrack: (id: TrackId, offset: number) => {
    if (offset === 0 || isNaN(offset)) return;
    dispatch(rotateScaleTrack(id, offset));
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
  clearScaleTrack: (id: TrackId) => {
    dispatch(clearNotesFromScaleTrack(id));
  },
  createScale: (scale: ScaleNoId) => {
    return dispatch(
      createScale({
        notes: scale.notes,
        name: scale.name ?? "New Scale",
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
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface ScaleEditorProps extends Props, StateProps {}

export default connector(ScaleEditor);
