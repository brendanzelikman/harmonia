import { Midi } from "@tonejs/midi";
import { isUndefined, some } from "lodash";
import { Tick } from "types/units";
import {
  selectClipById,
  selectClipIds,
  selectClipMap,
  selectClipMotif,
  selectClips,
  selectPatternClips,
  selectPoseClipById,
  selectTimedClipById,
} from "./ClipSelectors";
import { updatePose } from "types/Pose/PoseSlice";
import { isPoseOperation } from "types/Pose/PoseTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectClipStartTime } from "types/Arrangement/ArrangementClipSelectors";
import {
  initializeClip,
  ClipId,
  PoseClipId,
  Clip,
  initializePoseClip,
  PortaledPatternClip,
} from "./ClipTypes";
import {
  selectClosestPoseClipId,
  selectPatternClipStreamMap,
  selectPortaledClipById,
  selectTrackClipIds,
  selectTrackPortaledClipIdsMap,
} from "types/Arrangement/ArrangementSelectors";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import {
  selectTransport,
  selectTransportBPM,
} from "types/Transport/TransportSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import {
  addClip,
  addClips,
  removeClip,
  updateClip,
  updateClips,
} from "./ClipSlice";
import {
  selectIsLive,
  selectMediaSelection,
  selectSelectedPatternClips,
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
import { promptUserForString } from "utils/html";
import {
  selectOrderedTracks,
  selectTrackById,
  selectTrackDescendantIds,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { createEighthNote, createEighthRest } from "utils/durations";
import { autoBindNoteToTrack } from "types/Track/TrackThunks";
import { PatternId, PatternStream } from "types/Pattern/PatternTypes";
import { updatePattern } from "types/Pattern/PatternSlice";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { getMidiFromPitch } from "utils/midi";
import { TrackId } from "types/Track/TrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";

/** Open or close the dropdown of a clip */
export const toggleClipDropdown =
  (payload: Payload<{ id: ClipId; value?: boolean }>): Thunk =>
  (dispatch, getProject) => {
    const { id, value } = payload.data;
    const project = getProject();
    const clipIds = selectClipIds(project);
    const clipMap = selectClipMap(project);
    const clip = selectClipById(project, id);
    if (!clip) return;
    const newValue = value === undefined ? !clip.isOpen : value;
    if (newValue) {
      for (const clipId of clipIds) {
        if (clipMap[clipId]?.isOpen) {
          dispatch(updateClip({ data: { ...clipMap[clipId], isOpen: false } }));
        }
      }
    }
    dispatch(updateClip({ data: { id, isOpen: newValue } }));
  };

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
    const portaledPoseCip = poseClipId
      ? selectPortaledClipById(project, poseClipId)
      : undefined;
    const isLive = selectIsLive(project);
    const isPosed = !!portaledPoseCip?.isOpen;

    if (isLive && poseClipId && isPosed) {
      dispatch(setSelectedTrackId({ data: null, undoType }));
      dispatch(removeClipIdsFromSelection({ data: [poseClipId], undoType }));
      dispatch(toggleClipDropdown({ data: { id: poseClipId, value: false } }));
      return;
    }

    // If the clip is posed, select the pose clip and open the dropdown
    if (isLive && poseClipId && !isPosed) {
      dispatch(addClipIdsToSelection({ data: [poseClipId], undoType }));
      dispatch(setSelectedTrackId({ data: trackId, undoType }));
      dispatch(toggleClipDropdown({ data: { id: poseClipId, value: true } }));
      return;
    }

    // Otherwise, create a pose clip for the pattern clip
    const poseId = dispatch(createPose());
    const poseClip = initializePoseClip({
      trackId,
      tick,
      poseId,
      isOpen: true,
    });
    const clipId = dispatch(addClip({ data: poseClip }));
    dispatch(addClipIdsToSelection({ data: [clipId], undoType }));
    dispatch(setSelectedTrackId({ data: trackId, undoType }));
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
    if (!sinkPose.stream) return;
    if (!sourcePose.vector) return;
    const sourceVector = sourcePose.vector;

    // Sum the source vector to each block in the sink pose
    const stream = sinkPose.stream.map((block) => {
      if (!isPoseOperation(block)) return block;
      return { ...block, vector: sumVectors(block.vector, sourceVector) };
    });

    // Update the sink pose with the new stream
    dispatch(updatePose({ id: sinkPose.id, stream }));

    // Delete the source pose clip
    dispatch(deleteMedia({ data: { clipIds: [sourceId] } }));
  };

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (
    ids: ClipId[],
    options: { filename?: string; download?: boolean } = { download: true }
  ): Thunk<Blob> =>
  (_dispatch, getProject) => {
    const project = getProject();
    const meta = selectMeta(project);
    const transport = selectTransport(project);

    const clips = ids
      .map((id) => selectClipById(project, id))
      .filter((clip) => !!clip && clip.type === "pattern");
    const tracks = selectOrderedTracks(project).filter((track) =>
      clips.some((clip) => clip?.trackId === track.id)
    );
    const trackClipIdMap = selectTrackPortaledClipIdsMap(project);
    const clipStreamMap = selectPatternClipStreamMap(project);

    // Prepare a new MIDI file
    const midi = new Midi();
    const bpm = selectTransportBPM(project);
    midi.header.setTempo(bpm);

    // Iterate through each track
    tracks.forEach((track, i) => {
      const clipIds = trackClipIdMap[track.id];
      if (!clipIds.length) return;

      // Create a MIDI track
      const midiTrack = midi.addTrack();
      midiTrack.name = `Track ${selectTrackLabelById(project, track.id)}`;
      midiTrack.channel = i;

      // Add each clip to the MIDI track
      clipIds.forEach((clipId) => {
        // Get the stream of the clip
        const startTime = selectClipStartTime(project, clipId);
        const stream = clipStreamMap[clipId];
        if (!stream || isUndefined(startTime)) return;

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
    a.download = `${options?.filename ?? meta.name ?? "file"}.mid`;
    if (options?.download) a.click();
    URL.revokeObjectURL(url);
    return blob;
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportTrackToMIDI =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clipIds: ClipId[] = [];
    const track = selectTrackById(project, trackId);
    if (!track) return;

    if (isScaleTrackId(trackId)) {
      const ids = [trackId, ...selectTrackDescendantIds(project, trackId)];
      clipIds.push(...ids.flatMap((id) => selectTrackClipIds(project, id)));
    } else {
      clipIds.push(...selectTrackClipIds(project, track.id));
    }

    dispatch(exportClipsToMidi(clipIds));
  };

export const inputPatternStream =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      title: "Update the Selected Pattern",
      description: `Please input a list of notes separated by spaces to update the selected pattern, e.g. "60 64 67".`,
      callback: (input) => {
        const project = getProject();
        const patternClips = selectPatternClips(project);
        const selectedClips = selectSelectedPatternClips(project);
        const clip = id
          ? patternClips.find((clip) => clip.patternId === id)
          : selectedClips[0];
        if (!clip) return;

        const notes: PatternStream = [];
        const regex = /(\d+|[A-G]#?\d?)/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(input)) !== null) {
          const token = match[1];
          const isNumber = /^\d+$/.test(token);
          const midi = isNumber ? parseInt(token, 10) : getMidiFromPitch(token);
          const isRest = midi <= 0;
          if (isRest) {
            notes.push(createEighthRest());
          } else {
            const note = createEighthNote(midi);
            notes.push(dispatch(autoBindNoteToTrack(clip?.trackId, note)));
          }
        }

        const pattern = selectPatternById(project, clip.patternId);
        const stream = [...pattern.stream, ...notes];
        dispatch(updatePattern({ id: pattern.id, stream }));
      },
    })();
