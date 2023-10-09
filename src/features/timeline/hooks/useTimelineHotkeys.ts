import { useHotkeys } from "react-hotkeys-hook";
import { useAppSelector, useDispatch } from "redux/hooks";
import * as Timeline from "redux/Timeline";
import * as Media from "redux/Media";
import { getMediaClips, getMediaTranspositions } from "types/Media";
import { seekTransport, selectTransport } from "redux/Transport";
import {
  selectSelectedMedia,
  selectSelectedTrack,
  setSelectedTrack,
} from "redux/Root";
import { selectOrderedTracks } from "redux/selectors";
import { mod } from "utils";

export default function useTimelineHotkeys() {
  const dispatch = useDispatch();
  const { tick } = useAppSelector(selectTransport);
  const selectedMedia = useAppSelector(selectSelectedMedia);
  const selectedTrack = useAppSelector(selectSelectedTrack);
  const orderedTracks = useAppSelector(selectOrderedTracks);
  const gridTick = useAppSelector(Timeline.selectSubdivisionTicks);

  // Meta + A = Select All Media
  useHotkeys("meta+a", () => dispatch(Media.selectAllMedia()));

  // Meta + C = Copy Selected Media
  useHotkeys("meta+c", () => dispatch(Media.copySelectedMedia()));

  // Meta + V = Paste Copied Media
  useHotkeys("meta+v", () => dispatch(Media.pasteSelectedMedia()));

  // Meta + X = Cut Selected Media
  useHotkeys("meta+x", () => dispatch(Media.cutSelectedMedia()));

  // Meta + D = Duplicate Selected Media
  useHotkeys("meta+d", () => dispatch(Media.duplicateSelectedMedia()));

  // Shift + M = Export Selected Media
  useHotkeys("shift+m", () => dispatch(Timeline.exportSelectedClipsToMIDI()));

  // Backspace = Delete Selected Media
  useHotkeys("backspace", () => dispatch(Media.deleteSelectedMedia()));

  // A = Toggle Adding Clip
  useHotkeys("a", () => dispatch(Timeline.toggleAddingClip()));

  // C = Toggle Cutting Clip
  useHotkeys("c", () => dispatch(Timeline.toggleCuttingClip()));

  // M = Toggle Merging Clips
  useHotkeys("m", () => dispatch(Timeline.toggleMergingClips()));

  // R = Toggle Repeating Clips
  useHotkeys("r", () => dispatch(Timeline.toggleRepeatingClips()));

  // T = Toggle Transposing Clip
  useHotkeys("t", () => dispatch(Timeline.toggleTransposingClip()));

  // Meta + "-" = Decrease Subdivision
  useHotkeys("meta+-", () => dispatch(Timeline.decreaseSubdivision()));

  // Meta + "=" = Increase Subdivision
  useHotkeys("meta+=", () => dispatch(Timeline.increaseSubdivision()));

  // Left Arrow = Move Media Left or Move Playhead Left
  useHotkeys(
    "left",
    () => {
      if (selectedMedia.length > 0) {
        const newMedia = selectedMedia.map((media) => ({
          ...media,
          tick: media.tick - gridTick,
        }));
        if (newMedia.some((media) => media.tick < 0)) return;
        const newClips = getMediaClips(newMedia);
        const newTranspositions = getMediaTranspositions(newMedia);
        dispatch(Media.updateMedia(newClips, newTranspositions));
      } else {
        if (tick === 0) return;
        dispatch(seekTransport(tick - 1));
      }
    },
    [selectedMedia, tick, gridTick]
  );

  // Right Arrow = Move Media Right or Move Playhead Right
  useHotkeys(
    "right",
    () => {
      if (selectedMedia.length > 0) {
        const newMedia = selectedMedia.map((media) => ({
          ...media,
          tick: media.tick + gridTick,
        }));
        const newClips = getMediaClips(newMedia);
        const newTranspositions = getMediaTranspositions(newMedia);
        dispatch(Media.updateMedia(newClips, newTranspositions));
      } else {
        dispatch(seekTransport(tick + 1));
      }
    },
    [selectedMedia, tick, gridTick]
  );

  // Up Arrow = Select Previous Track
  useHotkeys(
    "up",
    () => {
      if (!selectedTrack) return;
      const index = orderedTracks.indexOf(selectedTrack);
      const previousTrack = orderedTracks[mod(index - 1, orderedTracks.length)];
      dispatch(setSelectedTrack(previousTrack.id));
    },
    [selectedTrack, orderedTracks]
  );

  // Down Arrow = Select Next Track
  useHotkeys(
    "down",
    () => {
      if (!selectedTrack) return;
      const index = orderedTracks.indexOf(selectedTrack);
      const nextTrack = orderedTracks[mod(index + 1, orderedTracks.length)];
      dispatch(setSelectedTrack(nextTrack.id));
    },
    [selectedTrack, orderedTracks]
  );
}
