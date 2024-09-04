import { useProjectDispatch, use } from "types/hooks";
import { useHotkeysInTimeline } from "lib/react-hotkeys-hook";
import { DataGridHandle } from "react-data-grid";
import { useAuth } from "providers/auth";
import { hideEditor } from "types/Editor/EditorSlice";
import { isScaleTrack } from "types/Track/TrackTypes";
import {
  setSelectedTrackId,
  decreaseSubdivision,
  increaseSubdivision,
  updateMediaSelection,
} from "types/Timeline/TimelineSlice";
import {
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
  downloadTransport,
  movePlayheadLeft,
  movePlayheadRight,
} from "types/Transport/TransportThunks";

export function useTimelineHotkeys(timeline?: DataGridHandle) {
  const dispatch = useProjectDispatch();
  const { isProdigy } = useAuth();
  const selectedTrack = use(selectSelectedTrack);
  const selectedMedia = use(selectSelectedMedia);
  const mediaLength = selectedMedia.length;

  // Shift + Enter = Reset Scroll Position
  useHotkeysInTimeline(
    "shift+enter",
    () => {
      if (!timeline?.element) return;
      timeline.element.scroll({ left: 0, behavior: "smooth" });
    },
    [timeline]
  );

  // Meta + Option + M = Save Timeline to MIDI
  useHotkeysInTimeline(
    "meta+alt+m",
    () => !isProdigy && dispatch(exportProjectToMIDI()),
    [isProdigy]
  );

  // Meta + Option + W = Save Timeline to WAV
  useHotkeysInTimeline("meta+alt+w", () => {
    dispatch(downloadTransport());
  });

  // Shift + S = Nest Scale Track
  useHotkeysInTimeline(
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
  useHotkeysInTimeline(
    "meta+shift+s",
    () => dispatch(insertScaleTrack(selectedTrack?.id)),
    [selectedTrack]
  );

  // Shift + P = Nest Pattern Track
  useHotkeysInTimeline(
    "shift+p",
    () => dispatch(createPatternTrackFromSelectedTrack()),
    []
  );

  // Shift + M = Export Selected Media
  useHotkeysInTimeline("shift+m", () => dispatch(exportSelectedClipsToMIDI()));

  // Meta + A = Select All Media
  useHotkeysInTimeline("meta+a", () => dispatch(addAllMediaToSelection()));

  // Meta + C = Copy Selected Media
  useHotkeysInTimeline("meta+c", () => dispatch(copySelectedMedia()));

  // Meta + V = Paste Copied Media
  useHotkeysInTimeline("meta+v", () => dispatch(pasteSelectedMedia()));

  // Meta + X = Cut Selected Media
  useHotkeysInTimeline("meta+x", () => dispatch(cutSelectedMedia()));

  // Meta + D = Duplicate Selected Media
  useHotkeysInTimeline("meta+d", () => dispatch(duplicateSelectedMedia()));

  // Backspace = Delete Selected Media
  useHotkeysInTimeline("backspace", () => dispatch(deleteSelectedMedia()));

  // Meta + Backspace = Delete Selected Track
  useHotkeysInTimeline("meta+backspace", () => dispatch(deleteSelectedTrack()));

  // Esc = Deselect Tracks
  useHotkeysInTimeline("esc", () => {
    dispatch(setSelectedTrackId({ data: null }));
    dispatch(updateMediaSelection({ data: { clipIds: [] } }));
    dispatch(hideEditor({ data: null }));
  });

  // C = Toggle Selected Clip Type
  useHotkeysInTimeline("c", () => dispatch(toggleTimelineType()), []);

  // A = Toggle Adding Clip
  useHotkeysInTimeline(
    "a",
    () => dispatch(toggleTimelineState({ data: `adding-clips` })),
    []
  );

  // + = Create New Clip
  useHotkeysInTimeline("shift+equal", () => dispatch(createTypedMotif()), []);

  // Meta + K = Toggle Slicing Media
  useHotkeysInTimeline("meta+k", () =>
    dispatch(toggleTimelineState({ data: `slicing-clips` }))
  );

  // Meta + J = Toggle Merging Media
  useHotkeysInTimeline("meta+j", () =>
    dispatch(toggleTimelineState({ data: `merging-clips` }))
  );

  // P = Toggle Adding Portals
  useHotkeysInTimeline("p", () =>
    dispatch(toggleTimelineState({ data: `portaling-clips` }))
  );

  // Meta + "-" = Decrease Subdivision
  useHotkeysInTimeline(["meta+minus"], () => dispatch(decreaseSubdivision()));

  // Meta + "=" = Increase Subdivision
  useHotkeysInTimeline(["meta+equal"], () => dispatch(increaseSubdivision()));

  // Left Arrow = Move Media Left or Move Playhead Left
  useHotkeysInTimeline(
    "left",
    () =>
      !!mediaLength
        ? dispatch(moveSelectedMediaLeft())
        : dispatch(movePlayheadLeft()),
    [mediaLength]
  );

  // Right Arrow = Move Media Right or Move Playhead Right
  useHotkeysInTimeline(
    "right",
    () => {
      !!mediaLength
        ? dispatch(moveSelectedMediaRight())
        : dispatch(movePlayheadRight());
    },
    [mediaLength]
  );

  // Shift + Left Arrow = Move Media Left or Move Playhead Left
  useHotkeysInTimeline(
    "shift + left",
    () =>
      !!mediaLength
        ? dispatch(moveSelectedMediaLeft(1))
        : dispatch(movePlayheadLeft(1)),
    [mediaLength]
  );

  // Shift Right Arrow = Move Media Right or Move Playhead Right
  useHotkeysInTimeline(
    "shift + right",
    () => {
      !!mediaLength
        ? dispatch(moveSelectedMediaRight(1))
        : dispatch(movePlayheadRight(1));
    },
    [mediaLength]
  );

  // Up Arrow = Select Previous Track
  useHotkeysInTimeline("up", () => dispatch(selectPreviousTrack()), []);

  // Down Arrow = Select Next Track
  useHotkeysInTimeline("down", () => dispatch(selectNextTrack()), []);
}
