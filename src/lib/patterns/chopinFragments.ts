import { selectPatternClipById } from "types/Clip/ClipSelectors";
import { PatternClipId } from "types/Clip/ClipTypes";
import { PatternMidiNote, PatternStream } from "types/Pattern/PatternTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { Thunk } from "types/Project/ProjectTypes";
import { ScaleVector } from "types/Scale/ScaleTypes";
import {
  selectTrackMidiScale,
  selectTrackScaleChain,
} from "types/Track/TrackSelectors";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import { sumVectors } from "utils/vector";

export const getChopinFragments =
  (id: PatternClipId, note: PatternMidiNote): Thunk<PatternStream> =>
  (dispatch, getProject) => {
    const project = getProject();
    const { duration } = note;
    const clipId = getOriginalIdFromPortaledClip(id) as PatternClipId;
    const clip = selectPatternClipById(project, clipId);
    if (!clip) return [];
    const scale = selectTrackMidiScale(project, clip.trackId);
    if (!scale.length) return [];

    const tonic = dispatch(autoBindNoteToTrack(clip.trackId, note));
    if (!("degree" in tonic)) return [];

    const chain = selectTrackScaleChain(project, clip.trackId);
    if (!chain.length) return [];

    const scaleId = chain[0].id;

    const getOffset = (vector: ScaleVector) => {
      return sumVectors(tonic.offset, vector);
    };

    const fragment1 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 3 }) },
    ];

    const fragment2 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
    ];

    const fragment3 = [
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
    ];

    const fragment4 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ chromatic: 1 }) },
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
      { ...tonic },
    ];

    const fragment5 = [
      { ...tonic, duration: duration },
      {
        ...tonic,
        offset: getOffset({ [scaleId]: 1 }),
        duration: duration,
      },
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
    ];

    const fragment6 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 3 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
    ];

    const fragment7 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 3 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
    ];

    const fragment8 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: 2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
      { ...tonic },
    ];

    const fragment9 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
      { ...tonic, offset: getOffset({ chromatic: -2 }) },
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
    ];

    const fragment10 = [
      { ...tonic, offset: getOffset({ chromatic: -2 }) },
      { ...tonic, offset: getOffset({ chromatic: -1 }) },
      { ...tonic, offset: getOffset({ chromatic: -2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
    ];

    const fragment11 = [
      { ...tonic },
      { ...tonic, offset: getOffset({ [scaleId]: -1 }) },
      { ...tonic, offset: getOffset({ [scaleId]: -2 }) },
      { ...tonic, offset: getOffset({ [scaleId]: -1 }) },
    ];

    const fragment12 = [
      { ...tonic, duration: duration * 1.5 },
      {
        ...tonic,
        offset: getOffset({ [scaleId]: 2 }),
        duration: duration * 0.5,
      },
      { ...tonic, offset: getOffset({ [scaleId]: 1 }) },
      { ...tonic },
    ];

    const fragment13 = [
      {
        ...tonic,
        offset: getOffset({ [scaleId]: -3 }),
        duration: duration * 2,
      },
      {
        ...tonic,
        offset: getOffset({ [scaleId]: 2 }),
        duration: duration * 2,
      },
    ];

    const fragment14 = [
      {
        ...tonic,
        offset: getOffset({ [scaleId]: 1 }),
        duration: duration * 2,
      },
      {
        ...tonic,
        duration: duration * 2,
      },
    ];

    const fragments: PatternStream[] = [
      fragment1,
      fragment2,
      fragment3,
      fragment4,
      fragment5,
      fragment6,
      fragment7,
      fragment8,
      fragment9,
      fragment10,
      fragment11,
      fragment12,
      fragment13,
      fragment14,
    ];
    const index = Math.floor(Math.random() * fragments.length);
    const fragment = fragments[index];
    return fragment;
  };
