import * as Timeline from "redux/Timeline";
import * as Media from "redux/Media";
import * as Transport from "redux/Transport";
import * as Project from "redux/Project";

import { useProjectSelector, useProjectDispatch } from "redux/hooks";
import { useScopedHotkeys, useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { showEditor } from "redux/Editor";
import { redoArrangement, undoArrangement } from "redux/Arrangement";
import { useEffect } from "react";

const useHotkeys = useScopedHotkeys("timeline");
const useTransportHotkeys = useScopedHotkeys("transport");

export function useTimelineHotkeys() {
  const dispatch = useProjectDispatch();
  const selectedMedia = useProjectSelector(Timeline.selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Meta + Z = Undo Arrangement
  useTransportHotkeys("meta+z", () => dispatch(undoArrangement()));

  // Meta + Shift + Z = Redo Arrangement
  useTransportHotkeys("meta+shift+z", () => dispatch(redoArrangement()));

  // Space = Play/Pause Transport
  useTransportHotkeys("space", () => dispatch(Transport.toggleTransport()));

  // Enter = Stop Transport
  useTransportHotkeys("enter", () => dispatch(Transport.stopTransport()));

  // Stop the transport on unmount
  useEffect(() => () => dispatch(Transport.stopTransport()), []);

  // L = Toggle Loop
  useHotkeys("l", () => dispatch(Transport.toggleTransportLoop()));

  // Shift + R = Toggle Recording
  useHotkeys("shift+r", () => dispatch(Transport.toggleTransportRecording()));

  // Meta + Shift + M = Toggle Transport Mute
  useOverridingHotkeys("meta+shift+m", () =>
    dispatch(Transport.toggleTransportMute())
  );

  // Meta + Option + M = Save Timeline to MIDI
  useHotkeys("meta+alt+m", () => dispatch(Project.exportProjectToMIDI()));

  // Shift + M = Export Selected Media
  useHotkeys("shift+m", () => dispatch(Timeline.exportSelectedClipsToMIDI()));

  // Meta + A = Select All Media
  useHotkeys("meta+a", () => dispatch(Media.addAllMediaToSelection()));

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

  // Meta + Backspace = Delete Selected Track
  useHotkeys("meta+backspace", () => dispatch(Timeline.deleteSelectedTrack()));

  // Alt+P = Toggle Pattern Editor
  useHotkeys("c", () => dispatch(showEditor("patterns")));

  // A = Toggle Adding Clip
  useHotkeys("a", () => dispatch(Timeline.toggleAddingClips()));

  // T = Toggle Adding Transpositions
  useHotkeys("t", () => dispatch(Timeline.toggleAddingTranspositions()));

  // Alt + C = Toggle Slicing Media
  useHotkeys("alt+s", () => dispatch(Timeline.toggleSlicingMedia()));

  // Alt + M = Toggle Merging Media
  useHotkeys("alt+m", () => dispatch(Timeline.toggleMergingMedia()));

  // P = Toggle Adding Portals
  useHotkeys("alt+p", () => dispatch(Timeline.togglePortalingMedia()));

  // Meta + "-" = Decrease Subdivision
  useHotkeys(["meta+minus"], () => dispatch(Timeline.decreaseSubdivision()));

  // Meta + "=" = Increase Subdivision
  useHotkeys(["meta+="], () => dispatch(Timeline.increaseSubdivision()));

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
  useHotkeys("up", () => dispatch(Timeline.selectPreviousTrack()), []);

  // Down Arrow = Select Next Track
  useHotkeys("down", () => dispatch(Timeline.selectNextTrack()), []);
}
