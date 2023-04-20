import * as Scales from "redux/slices/scales";
import { Note } from "types/units";
import { connect, ConnectedProps } from "react-redux";
import ScaleClass, {
  rotateScale,
  Scale,
  ScaleId,
  ScaleNoId,
  transposeScale,
} from "types/scales";
import { EditorScales } from "./Scales";
import { EditorProps } from "..";
import {
  selectActiveTrackId,
  selectCustomScales,
  selectScaleIds,
  selectScaleTrackScale,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { RootState } from "redux/store";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectActiveTrackId(state);
  const trackScale = trackId
    ? selectScaleTrackScale(state, trackId)
    : undefined;
  const { past, future } = state.scales;
  const canUndoScales = past.length > 0 && past[0].allIds.length > 0;
  const canRedoScales = future.length > 0;
  const scaleIds = selectScaleIds(state);
  const customScales = selectCustomScales(state);

  return {
    ...ownProps,
    trackScale,
    canUndoScales,
    canRedoScales,
    scaleIds,
    customScales,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  // Scales
  setScaleIds: (ids: ScaleId[]) => {
    dispatch(Scales.setScaleIds(ids));
  },
  updateScale: (scale: Scale) => {
    dispatch(Scales.updateScale(scale));
  },
  setScaleName: (scale: Scale, name: string) => {
    dispatch(Scales.updateScale({ id: scale.id, name }));
  },
  addNoteToScale: (id: ScaleId, note: Note) => {
    dispatch(Scales.addNoteToScale({ id, note }));
  },
  removeNoteFromScale: (id: ScaleId, note: Note) => {
    dispatch(Scales.removeNoteFromScale({ id, note }));
  },
  transposeScale: (id: ScaleId, offset: Note) => {
    dispatch(Scales.transposeScale({ id, offset }));
  },
  rotateScale: (id: ScaleId, offset: Note) => {
    dispatch(Scales.rotateScale({ id, offset }));
  },
  randomTransposeScale: (scale: Scale) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const random_T = Math.abs(Math.floor(Math.random() * 6) - 3) * direction;
    const random_t = Math.abs(Math.floor(Math.random() * 6) - 3) * -direction;
    const transposedScale = transposeScale(scale, random_T);
    dispatch(
      Scales.updateScale({
        id: scale.id,
        notes: rotateScale(transposedScale, random_t).notes,
      })
    );
  },
  exportScale: (scale: Scale) => {
    const xml = ScaleClass.serialize(scale.notes);
    if (!xml) return;
    const blob = new Blob([xml], { type: "text/musicxml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${scale.name}.musicxml`;
    document.body.appendChild(link);
    link.href = url;
    link.click();
    document.body.removeChild(link);
  },

  clearScale: (id: ScaleId) => {
    dispatch(Scales.clearScale(id));
  },
  createScale: (scale: ScaleNoId) => {
    dispatch(Scales.createScale({ notes: scale.notes, name: "New Scale" }));
  },
  deleteScale: (id: ScaleId) => {
    dispatch(Scales.deleteScale(id));
  },
  playScale: (id: ScaleId) => {
    dispatch(Scales.playScale(id));
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
export interface EditorScalesProps extends Props {}

export default connector(EditorScales);
