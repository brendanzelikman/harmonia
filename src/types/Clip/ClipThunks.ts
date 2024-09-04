import { Midi } from "@tonejs/midi";
import { isUndefined, some } from "lodash";
import { Tick } from "types/units";
import { selectPoseClipById, selectTimedClipById } from "./ClipSelectors";
import { isPoseBucket, getPoseBucketVector } from "types/Pose/PoseFunctions";
import { updatePose } from "types/Pose/PoseSlice";
import { isPoseVectorModule } from "types/Pose/PoseTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import {
  selectClips,
  selectClipsByTrackIds,
  selectClipStartTime,
} from "./ClipSelectors";
import { initializeClip, ClipId, PoseClipId } from "./ClipTypes";
import { selectPatternClipStreamMap } from "types/Arrangement/ArrangementSelectors";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { selectTracks } from "types/Track/TrackSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { addClips, removeClip } from "./ClipSlice";
import { selectMediaSelection } from "types/Timeline/TimelineSelectors";
import { deleteMedia } from "types/Media/MediaThunks";
import { removeClipIdsFromSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { sumVectors } from "utils/vector";

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
  (ids: ClipId[]): Thunk =>
  async (_dispatch, getProject) => {
    const project = getProject();
    const meta = selectMeta(project);
    const transport = selectTransport(project);
    const clips = selectClips(project).filter(({ id }) => ids.includes(id));
    const tracks = selectTracks(project).filter((track) =>
      clips.some((clip) => clip.trackId === track.id)
    );
    const clipStreamMap = selectPatternClipStreamMap(project);
    if (!some(clipStreamMap)) return;

    // Prepare a new MIDI file
    const midi = new Midi();

    // Iterate through each track
    tracks.forEach((track) => {
      const clips = selectClipsByTrackIds(project, [track.id]).filter((clip) =>
        ids.includes(clip.id)
      );
      if (!clips.length) return;

      // Create a MIDI track and add each clip
      const midiTrack = midi.addTrack();
      clips.forEach((clip) => {
        // Get the stream of the clip
        const startTime = selectClipStartTime(project, clip.id);
        const stream = clipStreamMap[clip.id];
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
    a.download = `${meta.name || "file"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
