import * as Scales from "redux/slices/scales";
import { Note } from "types/units";
import { connect, ConnectedProps } from "react-redux";
import ScaleClass, { Scale, ScaleId } from "types/scale";
import { ScaleEditor } from "./components/ScaleEditor";
import { EditorProps } from "..";
import {
  selectSelectedTrackId,
  selectCustomScales,
  selectScaleIds,
  selectScaleTrack,
  selectScaleTrackMap,
} from "redux/selectors";
import { UndoTypes } from "redux/undoTypes";
import { RootState } from "redux/store";
import { StateProps } from "../components/Editor";
import { exportScaleToMIDI, playScale } from "redux/thunks/scales";
import { MIDI } from "types/midi";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
} from "types/presets/scales";
import { getScaleTrackScale, ScaleTrack, TrackId } from "types";
import {
  addNoteToScaleTrack,
  clearNotesFromScaleTrack,
  removeNoteFromScaleTrack,
  rotateScaleTrack,
  transposeScaleTrack,
} from "redux/thunks";
import { updateScaleTrack } from "redux/slices/scaleTracks";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectSelectedTrackId(state);
  const scaleTrack = selectScaleTrack(state, trackId);
  const scaleTracks = selectScaleTrackMap(state);

  const scale = getScaleTrackScale(scaleTrack, scaleTracks);

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
    scaleTrack,
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
  updateScaleTrack: (scaleTrack: Partial<ScaleTrack>) => {
    dispatch(updateScaleTrack(scaleTrack));
  },
  setScaleName: (scale: Scale, name: string) => {
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
    const xml = ScaleClass.exportToXML(scale);
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
    dispatch(exportScaleToMIDI(scale));
  },
  clearScaleTrack: (id: TrackId) => {
    dispatch(clearNotesFromScaleTrack(id));
  },
  createScale: (scale: Scale) => {
    return dispatch(
      Scales.createScale({
        notes: scale.notes,
        name: scale.name ?? "New Scale",
      })
    );
  },
  deleteScale: (id?: ScaleId) => {
    if (!id) return;
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
