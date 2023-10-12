import * as Timeline from "redux/Timeline";
import * as Media from "redux/Media";
import * as Transport from "redux/Transport";
import * as Root from "redux/Root";

import { useAppSelector, useAppDispatch } from "redux/hooks";
import { useScopedHotkeys, useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { showEditor } from "redux/Editor";

const useHotkeys = useScopedHotkeys("timeline");

export default function useTimelineHotkeys() {
  const dispatch = useAppDispatch();
  const selectedMedia = useAppSelector(Root.selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Space = Play/Pause Transport
  useHotkeys("space", () => dispatch(Transport.toggleTransport()));

  // Enter = Stop Transport
  useHotkeys("enter", () => dispatch(Transport.stopTransport()));

  // L = Toggle Loop
  useHotkeys("l", () => dispatch(Transport.toggleTransportLoop()));

  // Meta + Shift + M = Toggle Transport Mute
  useOverridingHotkeys("meta+shift+m", () =>
    dispatch(Transport.toggleTransportMute())
  );

  // Meta + P = Toggle Pattern Editor
  useHotkeys("meta+p", () => dispatch(showEditor({ id: "patterns" })));

  // Meta + Option + M = Save Timeline to MIDI
  useHotkeys("meta+alt+m", () => dispatch(Root.saveStateToMIDI()));

  // Shift + M = Export Selected Media
  useHotkeys("shift+m", () => dispatch(Root.exportSelectedClipsToMIDI()));

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
    () =>
      !!mediaLength
        ? dispatch(Media.moveSelectedMediaLeft())
        : dispatch(Transport.movePlayheadLeft()),
    [mediaLength]
  );

  // Right Arrow = Move Media Right or Move Playhead Right
  useHotkeys(
    "right",
    () => {
      !!mediaLength
        ? dispatch(Media.moveSelectedMediaRight())
        : dispatch(Transport.movePlayheadRight());
    },
    [mediaLength]
  );

  // Up Arrow = Select Previous Track
  useHotkeys("up", () => dispatch(Root.selectPreviousTrack()));

  // Down Arrow = Select Next Track
  useHotkeys("down", () => dispatch(Root.selectNextTrack()));
}
