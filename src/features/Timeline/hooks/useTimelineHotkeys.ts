import * as Timeline from "redux/Timeline";
import * as Media from "redux/Media";
import * as Transport from "redux/Transport";
import * as Project from "redux/Project";

import { useProjectSelector, useProjectDispatch } from "redux/hooks";
import { useScopedHotkeys, useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { redoArrangement, undoArrangement } from "redux/Arrangement";
import { useEffect } from "react";
import { DataGridHandle } from "react-data-grid";
import { useTransportTick } from "hooks";
import { TRACK_WIDTH } from "utils/constants";

const useHotkeys = useScopedHotkeys("timeline");
const useTransportHotkeys = useScopedHotkeys("transport");

export function useTimelineHotkeys(timeline?: DataGridHandle) {
  const dispatch = useProjectDispatch();
  const tick = useTransportTick();
  const tickLeft = useProjectSelector((_) =>
    Timeline.selectTimelineTickLeft(_, tick)
  );
  const livePlay = useProjectSelector(Timeline.selectLivePlaySettings);
  const onAlphabetical = livePlay.enabled && livePlay.mode === "alphabetical";
  const selectedMedia = useProjectSelector(Timeline.selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Meta + Z = Undo Arrangement
  useHotkeys("meta+z", () => dispatch(undoArrangement()));

  // Meta + Shift + Z = Redo Arrangement
  useHotkeys("meta+shift+z", () => dispatch(redoArrangement()));

  // Space = Play/Pause Transport
  useTransportHotkeys("space", () => dispatch(Transport.toggleTransport()));

  // Enter = Stop Transport
  useTransportHotkeys("enter", () => dispatch(Transport.stopTransport()));

  // Shift + Enter = Reset Scroll Position
  useHotkeys(
    "shift+enter",
    () => {
      if (!timeline?.element) return;
      timeline.element.scroll({ left: 0, behavior: "smooth" });
    },
    [timeline]
  );

  // Shift + T = Scroll to Tick
  useHotkeys(
    "shift+t",
    () => {
      if (!timeline?.element) return;
      timeline.element.scroll({
        left: tickLeft - TRACK_WIDTH,
        behavior: "smooth",
      });
    },
    [timeline, tickLeft]
  );

  // Stop the transport on unmount
  useEffect(() => () => dispatch(Transport.stopTransport()), []);

  // L = Toggle Loop
  useTransportHotkeys("shift+l", () =>
    dispatch(Transport.toggleTransportLoop())
  );

  // Shift + R = Toggle Recording
  useHotkeys("shift+r", () => dispatch(Transport.toggleTransportRecording()));

  // Meta + Shift + M = Toggle Transport Mute
  useOverridingHotkeys("meta+shift+m", () =>
    dispatch(Transport.toggleTransportMute())
  );

  // Meta + Option + M = Save Timeline to MIDI
  useHotkeys("meta+alt+m", () => dispatch(Project.exportProjectToMIDI()));

  // Meta + Option + W = Save Timeline to WAV
  useHotkeys("meta+alt+w", () => {
    dispatch(Transport.downloadTransport());
  });

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

  // Esc = Deselect Tracks
  useHotkeys("esc", () => dispatch(Timeline.setSelectedTrackId(undefined)));

  // C = Toggle Selected Clip Type
  useHotkeys(
    "c",
    () => !onAlphabetical && dispatch(Timeline.toggleSelectedClipType()),
    [onAlphabetical]
  );

  // A = Toggle Adding Clip
  useHotkeys(
    "a",
    () => !onAlphabetical && dispatch(Timeline.toggleAddingClips()),
    [onAlphabetical]
  );

  // Meta + K = Toggle Slicing Media
  useHotkeys("meta+k", () => dispatch(Timeline.toggleSlicingMedia()));

  // Meta + J = Toggle Merging Media
  useHotkeys("meta+j", () => dispatch(Timeline.toggleMergingMedia()));

  // P = Toggle Adding Portals
  useHotkeys("meta+p", () => dispatch(Timeline.togglePortalingMedia()));

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
