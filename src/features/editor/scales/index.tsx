import * as Scales from "redux/slices/scales";
import { Note } from "types/units";
import { connect, ConnectedProps } from "react-redux";
import ScaleClass, {
  rotateScale,
  Scale,
  ScaleId,
  ScaleNoId,
  transposeScale,
} from "types/scale";
import { ScaleEditor } from "./components/ScaleEditor";
import { EditorProps } from "..";
import {
  selectSelectedTrackId,
  selectCustomScales,
  selectScaleIds,
  selectScaleTrackScale,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { RootState } from "redux/store";
import { StateProps } from "../components/Editor";
import { exportScaleToMIDI, playScale } from "redux/thunks/scales";
import { MIDI } from "types/midi";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
  PresetScaleList,
} from "types/presets/scales";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectSelectedTrackId(state);
  const scale = trackId ? selectScaleTrackScale(state, trackId) : undefined;
  const { past, future } = state.scales;
  const canUndoScales = past.length > 0 && past[0].allIds.length > 0;
  const canRedoScales = future.length > 0;
  const scaleIds = selectScaleIds(state);
  const customScales = selectCustomScales(state);

  // Get all matching scales

  const defaultPresets = Object.values({
    ...PresetScaleGroupMap,
  }).flat();
  const customPresets = customScales;

  const matchingDefaultScales = !!scale
    ? defaultPresets.filter((p) => ScaleClass.areRelated(scale, p))
    : [];
  const matchingCustomScales = !!scale
    ? customPresets.filter((p) => ScaleClass.areRelated(scale, p))
    : [];

  const matchingDefaultScale = scale
    ? matchingDefaultScales.find((s) => ScaleClass.areRelated(s, scale))
    : undefined;
  const matchingCustomScale = scale
    ? matchingCustomScales.find((s) => ScaleClass.areRelated(s, scale))
    : undefined;
  const matchesAnyScale = scale
    ? !!matchingDefaultScale || !!matchingCustomScale
    : false;

  // Get the name of the scale from the matching scale, NOT the underlying scale
  const firstScaleNote = scale?.notes?.[0];
  const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";

  // Get the category from any matching scale
  const scaleCategory = !!scale
    ? PresetScaleGroupList.find((c) =>
        PresetScaleGroupMap[c].some((m) => ScaleClass.areRelated(m, scale))
      ) ?? "Custom Scales"
    : "Custom Scales";

  const scaleName =
    !scale || !scale.notes.length
      ? "No Scale"
      : matchingCustomScale
      ? matchingCustomScale.name
      : matchingDefaultScale
      ? `${matchingDefaultScale.name} ${!!firstPitch ? `(${firstPitch})` : ""}`
      : "Custom Scale";

  return {
    ...ownProps,
    scale,
    scaleName,
    scaleCategory,
    canUndoScales,
    canRedoScales,
    scaleIds,
    customScales,
    matchesAnyScale,
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
  randomizeScale: (id: ScaleId) => {
    const scales = PresetScaleList;
    return dispatch(
      Scales.updateScale({
        id,
        notes: scales[Math.floor(Math.random() * scales.length)].notes,
      })
    );
  },
  exportScaleToXML: (scale: Scale) => {
    const xml = ScaleClass.exportToXML(scale.notes);
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
  exportScaleToMIDI: (scale: Scale) => {
    dispatch(exportScaleToMIDI(scale.id));
  },
  clearScale: (id: ScaleId) => {
    dispatch(Scales.clearScale(id));
  },
  createScale: (scale: ScaleNoId) => {
    return dispatch(
      Scales.createScale({
        notes: scale.notes,
        name: scale.name ?? "New Scale",
      })
    );
  },
  deleteScale: (id: ScaleId) => {
    dispatch(Scales.deleteScale(id));
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
