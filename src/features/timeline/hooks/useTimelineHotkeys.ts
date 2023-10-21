import * as Timeline from "redux/Timeline";
import * as Media from "redux/Media";
import * as Transport from "redux/Transport";
import * as Project from "redux/Project";

import { useAppSelector, useAppDispatch } from "redux/hooks";
import { useScopedHotkeys, useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { showEditor } from "redux/Editor";
import { redoArrangement, undoArrangement } from "redux/Arrangement";

const useGlobalHotkeys = useScopedHotkeys("timeline");
const useTransportHotkeys = useScopedHotkeys("transport");
const useMediaHotkeys = useScopedHotkeys("media");

export default function useTimelineHotkeys() {
  const dispatch = useAppDispatch();
  const selectedMedia = useAppSelector(Timeline.selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Meta + Z = Undo Arrangement
  useTransportHotkeys("meta+z", () => dispatch(undoArrangement()));

  // Meta + Shift + Z = Redo Arrangement
  useTransportHotkeys("meta+shift+z", () => dispatch(redoArrangement()));

  // Space = Play/Pause Transport
  useTransportHotkeys("space", () => dispatch(Transport.toggleTransport()));

  // Enter = Stop Transport
  useTransportHotkeys("enter", () => dispatch(Transport.stopTransport()));

  // L = Toggle Loop
  useGlobalHotkeys("l", () => dispatch(Transport.toggleTransportLoop()));

  // Meta + Shift + M = Toggle Transport Mute
  useOverridingHotkeys("meta+shift+m", () =>
    dispatch(Transport.toggleTransportMute())
  );

  // Meta + Option + M = Save Timeline to MIDI
  useGlobalHotkeys("meta+alt+m", () => dispatch(Project.exportProjectToMIDI()));

  // Shift + M = Export Selected Media
  useMediaHotkeys("shift+m", () =>
    dispatch(Timeline.exportSelectedClipsToMIDI())
  );

  // Meta + A = Select All Media
  useMediaHotkeys("meta+a", () => dispatch(Media.selectAllMedia()));

  // Meta + C = Copy Selected Media
  useMediaHotkeys("meta+c", () => dispatch(Media.copySelectedMedia()));

  // Meta + V = Paste Copied Media
  useMediaHotkeys("meta+v", () => dispatch(Media.pasteSelectedMedia()));

  // Meta + X = Cut Selected Media
  useMediaHotkeys("meta+x", () => dispatch(Media.cutSelectedMedia()));

  // Meta + D = Duplicate Selected Media
  useMediaHotkeys("meta+d", () => dispatch(Media.duplicateSelectedMedia()));

  // Backspace = Delete Selected Media
  useMediaHotkeys("backspace", () => dispatch(Media.deleteSelectedMedia()));

  // P = Toggle Pattern Editor
  useGlobalHotkeys("p", () => dispatch(showEditor({ id: "patterns" })));

  // A = Toggle Adding Clip
  useGlobalHotkeys("a", () => dispatch(Timeline.toggleAddingClips()));

  // T = Toggle Adding Transpositions
  useGlobalHotkeys("t", () => dispatch(Timeline.toggleAddingTranspositions()));

  // Alt + C = Toggle Slicing Media
  useGlobalHotkeys("alt+c", () => dispatch(Timeline.toggleSlicingMedia()));

  // Alt + M = Toggle Merging Media
  useGlobalHotkeys("alt+m", () => dispatch(Timeline.toggleMergingMedia()));

  // Meta + "-" = Decrease Subdivision
  useGlobalHotkeys(["meta+minus"], () =>
    dispatch(Timeline.decreaseSubdivision())
  );

  // Meta + "=" = Increase Subdivision
  useGlobalHotkeys(["meta+="], () => dispatch(Timeline.increaseSubdivision()));

  // Left Arrow = Move Media Left or Move Playhead Left
  useMediaHotkeys(
    "left",
    () =>
      !!mediaLength
        ? dispatch(Media.moveSelectedMediaLeft())
        : dispatch(Transport.movePlayheadLeft()),
    [mediaLength]
  );

  // Right Arrow = Move Media Right or Move Playhead Right
  useMediaHotkeys(
    "right",
    () => {
      !!mediaLength
        ? dispatch(Media.moveSelectedMediaRight())
        : dispatch(Transport.movePlayheadRight());
    },
    [mediaLength]
  );

  // Up Arrow = Select Previous Track
  useMediaHotkeys(
    "up",
    () => !mediaLength && dispatch(Timeline.selectPreviousTrack()),
    [mediaLength]
  );

  // Down Arrow = Select Next Track
  useMediaHotkeys(
    "down",
    () => !mediaLength && dispatch(Timeline.selectNextTrack()),
    [mediaLength]
  );
}
