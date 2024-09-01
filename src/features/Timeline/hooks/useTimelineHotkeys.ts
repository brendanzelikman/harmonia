import { useProjectSelector, useProjectDispatch, use } from "types/hooks";
import { useScopedHotkeys, useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useEffect, useState } from "react";
import { DataGridHandle } from "react-data-grid";
import { useTransportTick } from "hooks";
import { TRACK_WIDTH } from "utils/constants";
import { useAuth } from "providers/auth";
import { hideEditor } from "types/Editor/EditorSlice";
import { isScaleTrack } from "types/Track/TrackTypes";
import {
  setSelectedTrackId,
  decreaseSubdivision,
  increaseSubdivision,
} from "types/Timeline/TimelineSlice";
import {
  selectTimelineTickLeft,
  selectSelectedTrack,
  selectSelectedMedia,
} from "types/Timeline/TimelineSelectors";
import { createPatternTrackFromSelectedTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { createScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  addAllMediaToSelection,
  copySelectedMedia,
  pasteSelectedMedia,
  cutSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  moveSelectedMediaLeft,
  moveSelectedMediaRight,
} from "types/Media/MediaThunks";
import { exportProjectToMIDI } from "types/Project/ProjectExporters";
import {
  toggleTimelineType,
  createTypedMotif,
  toggleTimelineState,
} from "types/Timeline/TimelineThunks";
import {
  exportSelectedClipsToMIDI,
  deleteSelectedTrack,
  selectPreviousTrack,
  selectNextTrack,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { insertScaleTrack } from "types/Track/TrackThunks";
import {
  toggleTransport,
  stopTransport,
  toggleTransportLoop,
  toggleTransportRecording,
  toggleTransportMute,
  downloadTransport,
  movePlayheadLeft,
  movePlayheadRight,
} from "types/Transport/TransportThunks";

const useHotkeys = useScopedHotkeys("timeline");
const useTransportHotkeys = useScopedHotkeys("transport");

export function useTimelineHotkeys(timeline?: DataGridHandle) {
  const dispatch = useProjectDispatch();
  const { isProdigy } = useAuth();
  const tick = useTransportTick();
  const tickLeft = use((_) => selectTimelineTickLeft(_, tick));
  const selectedTrack = use(selectSelectedTrack);
  const selectedMedia = use(selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Space = Play/Pause Transport
  useOverridingHotkeys("space", () => dispatch(toggleTransport()));

  // Enter = Stop Transport
  useOverridingHotkeys("enter", () => dispatch(stopTransport()));

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
  useEffect(() => () => dispatch(stopTransport()), []);

  // L = Toggle Loop
  useTransportHotkeys("shift+l", () => dispatch(toggleTransportLoop()));

  // Shift + R = Toggle Recording
  useHotkeys("shift+r", () => dispatch(toggleTransportRecording()));

  // Meta + Shift + M = Toggle Transport Mute
  useOverridingHotkeys("meta+shift+m", () => dispatch(toggleTransportMute()));

  // Meta + Option + M = Save Timeline to MIDI
  useHotkeys(
    "meta+alt+m",
    () => !isProdigy && dispatch(exportProjectToMIDI()),
    [isProdigy]
  );

  // Meta + Option + W = Save Timeline to WAV
  useHotkeys("meta+alt+w", () => {
    dispatch(downloadTransport());
  });

  // Shift + S = Nest Scale Track
  useHotkeys(
    "shift+s",
    () =>
      dispatch(
        createScaleTrack({
          parentId: isScaleTrack(selectedTrack) ? selectedTrack?.id : undefined,
        })
      ),
    [selectedTrack]
  );

  // Meta + Shift + S = Insert Parent Scale Track
  useHotkeys(
    "meta+shift+s",
    () => dispatch(insertScaleTrack(selectedTrack?.id)),
    [selectedTrack]
  );

  // Shift + P = Nest Pattern Track
  useHotkeys(
    "shift+p",
    () => dispatch(createPatternTrackFromSelectedTrack()),
    []
  );

  // Shift + M = Export Selected Media
  useHotkeys("shift+m", () => dispatch(exportSelectedClipsToMIDI()));

  // Meta + A = Select All Media
  useHotkeys("meta+a", () => dispatch(addAllMediaToSelection()));

  // Meta + C = Copy Selected Media
  useHotkeys("meta+c", () => dispatch(copySelectedMedia()));

  // Meta + V = Paste Copied Media
  useHotkeys("meta+v", () => dispatch(pasteSelectedMedia()));

  // Meta + X = Cut Selected Media
  useHotkeys("meta+x", () => dispatch(cutSelectedMedia()));

  // Meta + D = Duplicate Selected Media
  useHotkeys("meta+d", () => dispatch(duplicateSelectedMedia()));

  // Backspace = Delete Selected Media
  useHotkeys("backspace", () => dispatch(deleteSelectedMedia()));

  // Meta + Backspace = Delete Selected Track
  useHotkeys("meta+backspace", () => dispatch(deleteSelectedTrack()));

  // Esc = Deselect Tracks
  useOverridingHotkeys("esc", () => {
    dispatch(setSelectedTrackId({ data: null }));
    dispatch(hideEditor({ data: null }));
  });

  // C = Toggle Selected Clip Type
  useHotkeys("c", () => dispatch(toggleTimelineType()), []);

  // A = Toggle Adding Clip
  useHotkeys(
    "a",
    () => dispatch(toggleTimelineState({ data: `adding-clips` })),
    []
  );

  // + = Create New Clip
  useHotkeys("shift+equal", () => dispatch(createTypedMotif()), []);

  // Meta + K = Toggle Slicing Media
  useHotkeys("meta+k", () =>
    dispatch(toggleTimelineState({ data: `slicing-clips` }))
  );

  // Meta + J = Toggle Merging Media
  useHotkeys("meta+j", () =>
    dispatch(toggleTimelineState({ data: `merging-clips` }))
  );

  // P = Toggle Adding Portals
  useHotkeys("p", () =>
    dispatch(toggleTimelineState({ data: `portaling-clips` }))
  );

  // Meta + "-" = Decrease Subdivision
  useHotkeys(["meta+minus"], () => dispatch(decreaseSubdivision()));

  // Meta + "=" = Increase Subdivision
  useHotkeys(["meta+equal"], () => dispatch(increaseSubdivision()));

  // Left Arrow = Move Media Left or Move Playhead Left
  useHotkeys(
    "left",
    () =>
      !!mediaLength
        ? dispatch(moveSelectedMediaLeft())
        : dispatch(movePlayheadLeft()),
    [mediaLength]
  );

  // Right Arrow = Move Media Right or Move Playhead Right
  useHotkeys(
    "right",
    () => {
      !!mediaLength
        ? dispatch(moveSelectedMediaRight())
        : dispatch(movePlayheadRight());
    },
    [mediaLength]
  );

  // Shift + Left Arrow = Move Media Left or Move Playhead Left
  useHotkeys(
    "shift + left",
    () =>
      !!mediaLength
        ? dispatch(moveSelectedMediaLeft(1))
        : dispatch(movePlayheadLeft(1)),
    [mediaLength]
  );

  // Shift Right Arrow = Move Media Right or Move Playhead Right
  useHotkeys(
    "shift + right",
    () => {
      !!mediaLength
        ? dispatch(moveSelectedMediaRight(1))
        : dispatch(movePlayheadRight(1));
    },
    [mediaLength]
  );

  // Up Arrow = Select Previous Track
  useHotkeys("up", () => dispatch(selectPreviousTrack()), []);

  // Down Arrow = Select Next Track
  useHotkeys("down", () => dispatch(selectNextTrack()), []);
}
