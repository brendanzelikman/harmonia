import { Clip } from "types/clips";

export const UndoTypes = {
  undoTimeline: "timeline/undo",
  redoTimeline: "timeline/redo",
  undoScales: "scales/undo",
  redoScales: "scales/redo",
  undoPatterns: "patterns/undo",
  redoPatterns: "patterns/redo",
  undoMixers: "mixers/undo",
  redoMixers: "mixers/redo",
};

export const groupByActionType = (action: any) => {
  switch (action.type) {
    // Add Clip
    case "clips/addClip":
      return `ADD_CLIP:${action.payload.id}`;

    // Remove Clip
    case "clips/removeClip":
      return `REMOVE_CLIP:${action.payload}`;

    // Update Clip
    case "clips/updateClip":
      const { id, startTime } = action.payload;
      return `UPDATE_CLIP:${id}@${startTime}`;

    // Cut Clip
    case "clips/cutClip":
      const { oldClip } = action.payload;
      return `CUT_CLIP:${oldClip.id}`;

    // Add Clips
    case "clips/addClips":
      return `ADD_CLIPS:${action.payload
        .map((clip: Clip) => clip.id)
        .join(",")}`;

    // Remove Clips
    case "clips/removeClips":
      return `REMOVE_CLIPS:${action.payload.join(",")}`;

    case "clips/removeClipsByPatternTrackId":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Update Clips
    case "clips/updateClips":
      const clips = action.payload;
      const clipTags = clips.map(
        (clip: Clip) => `${clip.id}@${clip.startTime}`
      );
      return `UPDATE_CLIPS:${clipTags.join(",")}`;

    // Clear Clips by Pattern Track Id
    case "clips/clearClipsByPatternTrackId":
      return `CLEAR_PATTERN_TRACK:${action.payload}`;

    // Add a Scale Track
    case "scaleTracks/addScaleTrack":
      return `ADD_SCALE_TRACK:${action.payload.id}`;

    // Remove a Scale Track
    case "scaleTracks/removeScaleTrack":
      return `REMOVE_SCALE_TRACK:${action.payload}`;

    // Add a Pattern Track
    case "patternTracks/addPatternTrack":
      return `ADD_PATTERN_TRACK:${action.payload.id}`;

    // Remove a Pattern Track
    case "patternTracks/removePatternTrack":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Add a Mixer
    case "mixers/addMixer":
      return `ADD_PATTERN_TRACK:${action.payload.trackId}`;

    // Remove a Mixer
    case "mixers/removeMixer":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Add a Transform
    case "transforms/addTransform":
      return `ADD_TRANSFORM:${action.payload.id}`;

    // Remove a Transform
    case "transforms/removeTransform":
      return `REMOVE_TRANSFORM:${action.payload}`;

    // Remove Transforms by Scale Track Id
    case "transforms/removeTransformsByScaleTrackId":
      return `REMOVE_SCALE_TRACK:${action.payload}`;

    // Remove Transforms by Pattern Track Id
    case "transforms/removeTransformsByPatternTrackId":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Clear Transforms by Scale Track Id
    case "transforms/clearTransformsByScaleTrackId":
      return `CLEAR_SCALE_TRACK:${action.payload}`;

    // Clear Transforms by Pattern Track Id
    case "transforms/clearTransformsByPatternTrackId":
      return `CLEAR_PATTERN_TRACK:${action.payload}`;

    // Add a Scale Track to the Track Map
    case "trackMap/addScaleTrackToTrackMap":
      return `ADD_SCALE_TRACK:${action.payload}`;

    // Remove a Scale Track from the Track Map
    case "trackMap/removeScaleTrackFromTrackMap":
      return `REMOVE_SCALE_TRACK:${action.payload}`;

    // Add a Pattern Track to the Track Map
    case "trackMap/addPatternTrackToTrackMap":
      return `ADD_PATTERN_TRACK:${action.payload.patternTrackId}`;

    // Remove a Pattern Track from the Track Map
    case "trackMap/removePatternTrackFromTrackMap":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Add a Pattern Track to the Clip Map
    case "clipMap/addPatternTrackToClipMap":
      return `ADD_PATTERN_TRACK:${action.payload}`;

    // Remove a Pattern Track from the Clip Map
    case "clipMap/removePatternTrackFromClipMap":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Clear a Pattern Track from the Clip Map
    case "clipMap/clearPatternTrackFromClipMap":
      return `CLEAR_PATTERN_TRACK:${action.payload}`;

    // Add a Clip to the Clip Map
    case "clipMap/addClipToClipMap":
      return `ADD_CLIP:${action.payload.clipId}`;

    // Remove a Clip from the Clip Map
    case "clipMap/removeClipFromClipMap":
      return `REMOVE_CLIP:${action.payload}`;

    // Cut a Clip from the Clip Map
    case "clipMap/cutClipFromClipMap":
      return `CUT_CLIP:${action.payload.oldClipId}`;

    // Add Clips to the Clip Map
    case "clipMap/addClipsToClipMap":
      return `ADD_CLIPS:${action.payload
        .map((payload: any) => payload.clipId)
        .join(",")}`;

    // Remove Clips from the Clip Map
    case "clipMap/removeClipsFromClipMap":
      return `REMOVE_CLIPS:${action.payload.join(",")}`;

    // Add a Scale Track to the Transform Map
    case "transformMap/addScaleTrackToTransformMap":
      return `ADD_SCALE_TRACK:${action.payload}`;

    // Remove a Scale Track from the Transform Map
    case "transformMap/removeScaleTrackFromTransformMap":
      return `REMOVE_SCALE_TRACK:${action.payload}`;

    // Clear a Scale Track from the Transform Map
    case "transformMap/clearScaleTrackFromTransformMap":
      return `CLEAR_SCALE_TRACK:${action.payload}`;

    // Add a Pattern Track to the Transform Map
    case "transformMap/addPatternTrackToTransformMap":
      return `ADD_PATTERN_TRACK:${action.payload}`;

    // Remove a Pattern Track from the Transform Map
    case "transformMap/removePatternTrackFromTransformMap":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Clear a Pattern Track from the Transform Map
    case "transformMap/clearPatternTrackFromTransformMap":
      return `CLEAR_PATTERN_TRACK:${action.payload}`;

    // Add a Transform to the Transform Map
    case "transformMap/addTransformToTransformMap":
      return `ADD_TRANSFORM:${action.payload.transformId}`;

    // Remove a Transform from the Transform Map
    case "transformMap/removeTransformFromTransformMap":
      return `REMOVE_TRANSFORM:${action.payload}`;

    default:
      return null;
  }
};
