import { Midi } from "@tonejs/midi";
import { isUndefined, some } from "lodash";
import { Tick } from "types/units";
import {
  selectClipMotif,
  selectPoseClipById,
  selectTimedClipById,
} from "./ClipSelectors";
import { isPoseBucket, getPoseBucketVector } from "types/Pose/PoseFunctions";
import { updatePose } from "types/Pose/PoseSlice";
import { isPoseVectorModule } from "types/Pose/PoseTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectClipStartTime } from "./ClipSelectors";
import {
  initializeClip,
  ClipId,
  PoseClipId,
  Clip,
  initializePoseClip,
  PortaledPatternClip,
  PortaledPatternClipId,
} from "./ClipTypes";
import {
  selectClosestPoseClipId,
  selectPatternClipStreamMap,
  selectPortaledClipMap,
} from "types/Arrangement/ArrangementSelectors";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import {
  selectTransport,
  selectTransportBPM,
} from "types/Transport/TransportSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { addClip, addClips, removeClip, updateClip } from "./ClipSlice";
import {
  selectIsLive,
  selectMediaSelection,
} from "types/Timeline/TimelineSelectors";
import { deleteMedia } from "types/Media/MediaThunks";
import {
  addClipIdsToSelection,
  removeClipIdsFromSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { sumVectors } from "utils/vector";
import { copyMotif } from "types/Motif/MotifFunctions";
import { addMotif } from "types/Motif/MotifThunks";
import { createPose } from "types/Pose/PoseThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { dispatchCustomEvent } from "utils/html";
import { getValueByKey } from "utils/objects";
import { selectTrackLabelById, selectTracks } from "types/Track/TrackSelectors";

/** Slice a clip and make sure the old ID is no longer selected. */
export const sliceClip =
  (payload: Payload<{ id: ClipId; tick: Tick }>): Thunk =>
  (dispatch, getProject) => {
    const { id, tick } = payload.data;
    if (!id) return;

    const project = getProject();
    const clip = selectTimedClipById(project, id);
    if (!clip) return;

    const mediaSelection = selectMediaSelection(project);
    const undoType = unpackUndoType(payload, "sliceClip");

    // Find the tick to split the clip at
    const splitTick = tick - clip.tick;
    if (tick === clip.tick || splitTick === clip.duration) return;
    if (splitTick < 0 || splitTick > clip.tick + clip.duration) return;

    // Get the two new clips
    const firstClip = initializeClip({ ...clip, duration: splitTick });
    const offset = (clip.offset || 0) + splitTick;
    const duration = clip.duration - splitTick;
    const secondClip = initializeClip({ ...clip, tick, offset, duration });

    // Filter the old clip out of the media selection
    const { clipIds } = mediaSelection;
    if (clipIds?.length) {
      dispatch(removeClipIdsFromSelection({ data: [id] }));
    }
    // Slice the clip
    dispatch(removeClip({ data: clip.id, undoType }));
    dispatch(addClips({ data: [firstClip, secondClip], undoType }));
  };

/** Migrate a clip's motif to a new copy. */
export const migrateClip =
  (payload: Payload<Clip>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = unpackUndoType(payload, `migrateClip`);
    const clip = payload.data;
    const type = clip.type;
    const motif = selectClipMotif(project, clip.id);
    if (!motif) return;
    const newMotif = copyMotif(motif);
    const field = `${type}Id`;
    const fieldId = newMotif.id;
    dispatch(addMotif({ data: newMotif, undoType }));
    dispatch(updateClip({ data: { id: clip.id, [field]: fieldId }, undoType }));
  };

/** Prepare a pattern clip for live play. */
export const preparePatternClip =
  (payload: Payload<PortaledPatternClip>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = unpackUndoType(payload, "preparePatternClip");
    const { id, trackId, tick } = payload.data;
    const poseClipId = selectClosestPoseClipId(project, id);
    const isLive = selectIsLive(project);
    const isPosed = !!poseClipId;

    if (isLive && poseClipId) {
      dispatch(setSelectedTrackId({ data: null, undoType }));
      dispatch(removeClipIdsFromSelection({ data: [poseClipId], undoType }));
      dispatchCustomEvent(`close_dropdown_${poseClipId}`, {});
      return;
    }

    // If the clip is posed, select the pose clip and open the dropdown
    if (isPosed && poseClipId) {
      dispatch(addClipIdsToSelection({ data: [poseClipId], undoType }));
      dispatch(setSelectedTrackId({ data: trackId, undoType }));
      dispatchCustomEvent(`open_dropdown_${poseClipId}`, {});
      return;
    }

    // Otherwise, create a pose clip for the pattern clip
    const poseId = dispatch(createPose());
    const poseClip = initializePoseClip({ trackId, tick, poseId });
    dispatch(addClip({ data: poseClip }));
  };

/** Merge the vector of a pose clip into another */
export const mergePoseClips =
  (sinkId: PoseClipId, sourceId: PoseClipId): Thunk =>
  async (dispatch, getProject) => {
    if (sinkId === sourceId) return;
    const project = getProject();

    // Get the sink and source clips
    const sinkPoseClip = selectPoseClipById(project, sinkId);
    const sourcePoseClip = selectPoseClipById(project, sourceId);
    if (!sinkPoseClip || !sourcePoseClip) return;

    // Get the sink and source poses
    const sinkPose = selectPoseById(project, sinkPoseClip.poseId);
    const sourcePose = selectPoseById(project, sourcePoseClip.poseId);
    if (!sinkPose || !sourcePose) return;

    // Get the source pose's bucket vector
    if (!isPoseBucket(sourcePose)) return;
    const sourceVector = getPoseBucketVector(sourcePose);

    // Sum the source vector to each block in the sink pose
    const stream = sinkPose.stream.map((block) => {
      if (!isPoseVectorModule(block)) return block;
      return { ...block, vector: sumVectors(block.vector, sourceVector) };
    });

    // Update the sink pose with the new stream
    dispatch(updatePose({ id: sinkPose.id, stream }));

    // Delete the source pose clip
    dispatch(deleteMedia({ data: { clipIds: [sourceId] } }));
  };

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (ids: ClipId[], options?: { filename: string }): Thunk =>
  async (_dispatch, getProject) => {
    if (!ids.length) return;
    const project = getProject();
    const meta = selectMeta(project);
    const transport = selectTransport(project);
    const tracks = selectTracks(project);
    const clipMap = selectPortaledClipMap(project);
    const clipStreamMap = selectPatternClipStreamMap(project);
    const clipIds = Object.keys(clipStreamMap) as PortaledPatternClipId[];
    if (!some(clipStreamMap)) return;

    // Prepare a new MIDI file
    const midi = new Midi();
    const bpm = selectTransportBPM(project);
    midi.header.setTempo(bpm);

    // Iterate through each track
    tracks.forEach((track) => {
      const clips = clipIds
        .filter((id) => ids.some((clipId) => id.includes(clipId)))
        .map((id) => clipMap[id])
        .filter((clip) => clip?.trackId === track.id) as PortaledPatternClip[];
      if (!clips.length) return;

      // Create a MIDI track
      const midiTrack = midi.addTrack();
      midiTrack.name = `Track ${selectTrackLabelById(project, track.id)}`;

      // Add each clip to the MIDI track
      clips.forEach((clip) => {
        // Get the stream of the clip
        const startTime = selectClipStartTime(project, clip.id);
        const stream = getValueByKey(clipStreamMap, clip.id);
        if (isUndefined(startTime) || isUndefined(stream)) return;

        // Iterate through each block
        for (let i = 0; i < stream.length; i++) {
          const { notes, startTick } = stream[i];
          if (!notes.length) continue;

          // Get the current time of the block
          const time = convertTicksToSeconds(transport, startTick);

          // Add each note to the MIDI track
          for (const note of notes) {
            const { MIDI, velocity } = note;
            const duration = convertTicksToSeconds(transport, note.duration);
            midiTrack.addNote({ midi: MIDI, duration, time, velocity });
          }
        }
      });
    });

    // Create a MIDI blob
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);

    // Download the MIDI file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options?.filename || meta.name || "file"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
