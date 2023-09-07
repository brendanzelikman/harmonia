import { Clip, createClipTag } from "types/clip";
import { Transform, createTransformTag } from "types/transform";

export const UndoTypes = {
  undoSession: "session/undo",
  redoSession: "session/redo",
  undoScales: "scales/undo",
  redoScales: "scales/redo",
  undoPatterns: "patterns/undo",
  redoPatterns: "patterns/redo",
};

export const groupByActionType = (action: any) => {
  switch (action.type) {
    // Add Clip
    case "clips/addClip":
      return `ADD_CLIP:${action.payload.id}`;

    // Add Clips
    case "clips/addClips":
      return `ADD_CLIPS:${action.payload
        .map((clip: Clip) => clip.id)
        .join(",")}`;

    // Add Clips With Transforms
    case "clips/addClipsWithTransforms":
      var clipTags = action.payload.clips.map(createClipTag);
      var transformTags = action.payload.transforms.map(createTransformTag);
      return `ADD_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

    // Remove Clip
    case "clips/removeClip":
      return `REMOVE_CLIP:${action.payload}`;

    // Remove Clips
    case "clips/removeClips":
      return `REMOVE_CLIPS:${action.payload.join(",")}`;

    // Remove Clips With Transforms
    case "clips/removeClipsWithTransforms":
      return `REMOVE_CLIPS_AND_TRANSFORMS:${action.payload.clipIds.join(
        ","
      )};${action.payload.transformIds.join(",")}`;

    // Remove Clips By Pattern Track Id
    case "clips/removeClipsByPatternTrackId":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Update Clip
    case "clips/updateClip":
      return `UPDATE_CLIP:${action.payload.id}@${action.payload.tick}`;

    // Update Clips
    case "clips/updateClips":
      const clips = action.payload;
      var clipTags = clips.map(createClipTag);
      return `UPDATE_CLIPS:${clipTags.join(",")}`;

    // Update Clips With Transforms
    case "clips/updateClipsWithTransforms":
      var clipTags = action.payload.clips.map(createClipTag);
      var transformTags = action.payload.transforms.map(createTransformTag);
      return `UPDATE_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

    // Slice Clip
    case "clips/sliceClip":
      const { oldClip } = action.payload;
      return `SLICE_CLIP:${oldClip.id}`;

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

    // Add Transforms
    case "transforms/addTransforms":
      return `ADD_TRANSFORMS:${action.payload
        .map((transform: Transform) => transform.id)
        .join(",")}`;

    // Add Transforms With Clips
    case "transforms/addTransformsWithClips":
      var clipTags = action.payload.clips.map(createClipTag);
      var transformTags = action.payload.transforms.map(createTransformTag);
      return `ADD_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

    // Remove a Transform
    case "transforms/removeTransform":
      return `REMOVE_TRANSFORM:${action.payload}`;

    // Remove Transforms
    case "transforms/removeTransforms":
      return `REMOVE_TRANSFORMS:${action.payload.join(",")}`;

    // Remove Transforms With Clips
    case "transforms/removeTransformsWithClips":
      return `REMOVE_CLIPS_AND_TRANSFORMS:${action.payload.clipIds.join(
        ","
      )};${action.payload.transformIds.join(",")}`;

    // Remove Transforms by Scale Track Id
    case "transforms/removeTransformsByScaleTrackId":
      return `REMOVE_SCALE_TRACK:${action.payload}`;

    // Remove Transforms by Pattern Track Id
    case "transforms/removeTransformsByPatternTrackId":
      return `REMOVE_PATTERN_TRACK:${action.payload}`;

    // Update Transform
    case "transforms/updateTransform":
      return `UPDATE_TRANSFORM:${action.payload.id}@${action.payload.tick}`;

    // Update Transforms
    case "transforms/updateTransforms":
      var transformTags = action.payload.map(createTransformTag);
      return `UPDATE_TRANSFORMS:${transformTags.join(",")}`;

    // Update Transforms With Clips
    case "transforms/updateTransformsWithClips":
      var transformTags = action.payload.transforms.map(createTransformTag);
      var clipTags = action.payload.clips.map(createClipTag);
      return `UPDATE_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

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

    // Add Clips to the Clip Map
    case "clipMap/addClipsToClipMap":
      return `ADD_CLIPS:${action.payload
        .map((payload: any) => payload.clipId)
        .join(",")}`;

    // Add Clips With Transforms to the Clip Map
    case "clipMap/addClipsWithTransformsToClipMap":
      var clipTags = action.payload.clips.map(createClipTag);
      var transformTags = action.payload.transforms.map(createTransformTag);
      return `ADD_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

    // Remove a Clip from the Clip Map
    case "clipMap/removeClipFromClipMap":
      return `REMOVE_CLIP:${action.payload}`;

    // Remove Clips from the Clip Map
    case "clipMap/removeClipsFromClipMap":
      return `REMOVE_CLIPS:${action.payload.join(",")}`;

    // Remove Clips With Transforms From The Clip Map
    case "clipMap/removeClipsWithTransformsFromClipMap":
      return `REMOVE_CLIPS_AND_TRANSFORMS:${action.payload.clipIds.join(
        ","
      )};${action.payload.transformIds.join(",")}`;

    // Slice a Clip from the Clip Map
    case "clipMap/sliceClipFromClipMap":
      return `SLICE_CLIP:${action.payload.oldClipId}`;

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

    // Add Transforms to the Transform Map
    case "transformMap/addTransformsToTransformMap":
      return `ADD_TRANSFORMS:${action.payload
        .map((payload: any) => payload.transformId)
        .join(",")}`;

    // Add Transforms With Clips To The Transform Map
    case "transformMap/addTransformsWithClipsToTransformMap":
      var clipTags = action.payload.clips.map(createClipTag);
      var transformTags = action.payload.transforms.map(createTransformTag);
      return `ADD_CLIPS_AND_TRANSFORMS:${clipTags.join(
        ","
      )};${transformTags.join(",")}`;

    // Remove a Transform from the Transform Map
    case "transformMap/removeTransformFromTransformMap":
      return `REMOVE_TRANSFORM:${action.payload}`;

    // Remove Transforms from the Transform Map
    case "transformMap/removeTransformsFromTransformMap":
      return `REMOVE_TRANSFORMS:${action.payload.join(",")}`;

    // Remove Transforms With Clips From the Transform Map
    case "transformMap/removeTransformsWithClipsFromTransformMap":
      return `REMOVE_CLIPS_AND_TRANSFORMS:${action.payload.clipIds.join(
        ","
      )};${action.payload.transformIds.join(",")}`;

    default:
      return null;
  }
};
