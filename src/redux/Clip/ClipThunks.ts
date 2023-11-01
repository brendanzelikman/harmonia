import * as _ from "redux/selectors";
import {
  addMediaToHierarchy,
  removeMediaFromHierarchy,
  updateMediaInHierarchy,
} from "redux/TrackHierarchy";
import { Thunk } from "types/Project";
import { Midi } from "@tonejs/midi";
import { ClipId, ClipNoId, initializeClip } from "types/Clip";
import { _updateClips, addClips, removeClips } from "./ClipSlice";
import { updateMediaSelection } from "redux/Timeline/TimelineSlice";
import { isUndefined, without } from "lodash";
import { RemoveMediaPayload, UpdateMediaPayload } from "types/Media";
import { isPatternRest } from "types/Pattern";
import { convertTicksToSeconds } from "types/Transport";
import { hasKeys } from "utils/objects";

/** Create a list of clips and add them to the clip slice and hierarchy. */
export const createClips =
  (clipNoIds: Partial<ClipNoId>[]): Thunk<ClipId[]> =>
  (dispatch) => {
    if (!clipNoIds.length) return [];
    const clips = clipNoIds.map(initializeClip);
    dispatch(addClips({ clips }));
    dispatch(addMediaToHierarchy({ clips }));
    return clips.map((clip) => clip.id);
  };

/** Update the clips in the slice and hierarchy. */
export const updateClips =
  (media: UpdateMediaPayload): Thunk =>
  (dispatch) => {
    if (!media.clips?.length) return;
    dispatch(_updateClips(media));
    dispatch(updateMediaInHierarchy(media));
  };

/** Delete a list of clips from the clip slice and hierarchy. */
export const deleteClips =
  (mediaIds: RemoveMediaPayload): Thunk =>
  (dispatch, getProject) => {
    if (!mediaIds.clipIds?.length) return;

    // Delete the clips from the slice and hierarchy.
    dispatch(removeClips(mediaIds));
    dispatch(removeMediaFromHierarchy(mediaIds));

    // Filter the clips out of the media selection
    const project = getProject();
    const mediaSelection = _.selectMediaSelection(project);
    const selectedClipIds = mediaSelection.clipIds;
    const filteredIds = without(selectedClipIds, ...mediaIds.clipIds);
    dispatch(updateMediaSelection({ clipIds: filteredIds }));
  };

/** Export a list of clips to MIDI by ID and download them as a file. */
export const exportClipsToMidi =
  (ids: ClipId[]): Thunk =>
  async (_dispatch, getProject) => {
    const project = getProject();
    const hierarchy = _.selectTrackHierarchy(project);
    const meta = _.selectMetadata(project);
    const transport = _.selectTransport(project);
    const trackIds = _.selectOrderedTrackIds(project);
    const clipStreamMap = _.selectClipStreamMap(project);
    if (!hasKeys(clipStreamMap)) return;

    // Prepare a new MIDI file
    const midi = new Midi();

    // Iterate through each track
    trackIds.forEach((trackId) => {
      const track = _.selectPatternTrackById(project, trackId);
      const trackClipIds = hierarchy.byId[trackId].clipIds;
      const clipIds = trackClipIds.filter((id) => ids.includes(id));
      if (!track || !clipIds.length) return;

      // Create a track for each clip
      const midiTrack = midi.addTrack();
      clipIds.forEach((id) => {
        // Get the stream of the clip
        const startTime = _.selectClipStartTime(project, id);
        const stream = clipStreamMap[id];
        if (isUndefined(startTime) || isUndefined(stream)) return;

        // Iterate through each block
        for (let i = 0; i < stream.length; i++) {
          const block = stream[i];

          // Skip the block if it's a rest or empty
          if (isPatternRest(block) || !block.length) continue;

          // Get the current time of the block
          const time = startTime + convertTicksToSeconds(transport, i);

          // Add each note to the MIDI track
          for (const note of block) {
            const { MIDI, duration, velocity } = note;
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
