import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "utils";
import { Row } from "..";
import useEventListeners from "hooks/useEventListeners";
import useKeyHolder from "hooks/useKeyHolder";
import { AppDispatch, RootState } from "redux/store";
import { selectEditor, selectRoot, selectTrackParents } from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import { hideEditor } from "redux/slices/editor";
import { setSelectedTrack } from "redux/slices/root";
import {
  pasteSelectedClipsAndTranspositions,
  toggleTrackMute,
  toggleTrackSolo,
  unmuteTracks,
  unsoloTracks,
} from "redux/thunks";
import {
  offsetSelectedTranspositions,
  updateSelectedTranspositions,
} from "redux/thunks/transpositions";
import { TrackId, TranspositionOffsetRecord } from "types";

interface ShortcutProps {
  rows: Row[];
}

const mapStateToProps = (state: RootState, ownProps: ShortcutProps) => {
  const { selectedTrackId } = selectRoot(state);
  const editor = selectEditor(state);
  const scaleTracks = selectTrackParents(state, selectedTrackId);
  return {
    ...ownProps,
    selectedTrackId,
    showingEditor: editor.show,
    scaleTracks,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setSelectedTrack: (trackId: TrackId) => {
    dispatch(setSelectedTrack(trackId));
  },
  hideEditor: () => {
    dispatch(hideEditor());
  },
  pasteClipsAndTranspositions: (rows: Row[]) => {
    dispatch(pasteSelectedClipsAndTranspositions(rows));
  },
  offsetSelectedTranspositions: (offset: TranspositionOffsetRecord) => {
    dispatch(offsetSelectedTranspositions(offset));
  },
  updateSelectedTranspositions: (update: TranspositionOffsetRecord) => {
    dispatch(updateSelectedTranspositions(update));
  },
  toggleTrackMute: (trackId?: TrackId) => {
    if (!trackId) return;
    dispatch(toggleTrackMute(trackId));
  },
  toggleTrackSolo: (trackId?: TrackId) => {
    if (!trackId) return;
    dispatch(toggleTrackSolo(trackId));
  },
  unmuteTracks: () => {
    dispatch(unmuteTracks());
  },
  unsoloTracks: () => {
    dispatch(unsoloTracks());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(useTimelineShortcuts);

function useTimelineShortcuts(props: Props) {
  const keys = ["`", "x", "q", "w", "s", "x", "f", "e", "z", "y", "u", "z"];
  const heldKeys = useKeyHolder(keys);

  const keyKeydown = (key: string) => (e: Event) => {
    if (isInputEvent(e) || isHoldingCommand(e)) return;
    cancelEvent(e);

    const number = parseInt(key);
    const patternTracks = props.rows.filter((r) => r.type === "patternTrack");

    // Toggle mute if holding y
    if (heldKeys.y) {
      props.toggleTrackMute(patternTracks[number - 1]?.trackId);
    }
    // Toggle solo if holding u
    if (heldKeys.u) {
      props.toggleTrackSolo(patternTracks[number - 1]?.trackId);
    }

    // Compute the initial offset based on up/down/shift
    const negative = heldKeys.z || heldKeys["`"];
    const dir = negative ? -1 : 1;
    let offset = isHoldingShift(e) ? 12 * dir : 0;
    offset += parseInt(key) * dir;

    // Apply all offsets if holding z
    if (heldKeys.z) {
      props.offsetSelectedTranspositions({
        _chromatic: offset,
        [props.scaleTracks?.[0]?.id ?? ""]: offset,
        [props.scaleTracks?.[1]?.id ?? ""]: offset,
        [props.scaleTracks?.[2]?.id ?? ""]: offset,
        _self: offset,
      });
      return;
    }

    // Apply chromatic offset if holding q
    if (heldKeys.q) {
      props.offsetSelectedTranspositions({
        _chromatic: offset,
      });
    }

    // Apply scalar offsets if holding w, s, or x
    let scaleTrackIds = [];
    if (heldKeys.w) {
      const id = props.scaleTracks?.[0]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (heldKeys.s) {
      const id = props.scaleTracks?.[1]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (heldKeys.x) {
      const id = props.scaleTracks?.[2]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (scaleTrackIds?.length) {
      props.offsetSelectedTranspositions(
        scaleTrackIds.reduce(
          (acc, id) => ({
            ...acc,
            [id]: offset,
          }),
          {}
        )
      );
    }

    // Apply chordal offset if holding e
    if (heldKeys.e) {
      props.offsetSelectedTranspositions({
        _self: offset,
      });
    }
  };

  const zeroKeydown = (e: Event) => {
    if (isInputEvent(e)) return;
    cancelEvent(e);

    // Unmute all tracks if holding y
    if (heldKeys.y) {
      props.unmuteTracks();
    }
    if (heldKeys.u) {
      props.unsoloTracks();
    }

    // Reset all offsets if holding z
    if (heldKeys.z) {
      props.updateSelectedTranspositions({
        _chromatic: 0,
        [props.scaleTracks?.[0]?.id ?? ""]: 0,
        [props.scaleTracks?.[1]?.id ?? ""]: 0,
        [props.scaleTracks?.[2]?.id ?? ""]: 0,
        _self: 0,
      });
      return;
    }

    // Reset the chromatic offset if holding q
    if (heldKeys.q) {
      props.updateSelectedTranspositions({ _chromatic: 0 });
    }

    // Reset the scalar offsets if holding w, s, or x
    let scaleTrackIds = [];
    if (heldKeys.w) {
      const id = props.scaleTracks?.[0]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (heldKeys.s) {
      const id = props.scaleTracks?.[1]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (heldKeys.x) {
      const id = props.scaleTracks?.[2]?.id;
      if (id) scaleTrackIds.push(id);
    }
    if (scaleTrackIds?.length) {
      props.updateSelectedTranspositions(
        scaleTrackIds.reduce(
          (acc, id) => ({
            ...acc,
            [id]: 0,
          }),
          {}
        )
      );
    }

    // Reset the chordal offset if holding e
    if (heldKeys.e) {
      props.updateSelectedTranspositions({ _self: 0 });
    }
  };

  useEventListeners(
    {
      "1": { keydown: keyKeydown("1") },
      "!": { keydown: keyKeydown("1") },
      "2": { keydown: keyKeydown("2") },
      "@": { keydown: keyKeydown("2") },
      "3": { keydown: keyKeydown("3") },
      "#": { keydown: keyKeydown("3") },
      "4": { keydown: keyKeydown("4") },
      $: { keydown: keyKeydown("4") },
      "5": { keydown: keyKeydown("5") },
      "%": { keydown: keyKeydown("5") },
      "6": { keydown: keyKeydown("6") },
      "^": { keydown: keyKeydown("6") },
      "7": { keydown: keyKeydown("7") },
      "&": { keydown: keyKeydown("7") },
      "8": { keydown: keyKeydown("8") },
      "*": { keydown: keyKeydown("8") },
      "9": { keydown: keyKeydown("9") },
      "(": { keydown: keyKeydown("9") },
      "-": { keydown: keyKeydown("10") },
      _: { keydown: keyKeydown("10") },
      "=": { keydown: keyKeydown("11") },
      "+": { keydown: keyKeydown("11") },
      "0": { keydown: zeroKeydown },
      ")": { keydown: zeroKeydown },

      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e) || props.showingEditor) return;
          cancelEvent(e);

          // Offset the selected transpositions
          const holdingShift = isHoldingShift(e);
          const N = heldKeys.q ? (holdingShift ? 12 : 1) : 0;
          const T1 = heldKeys.w ? (holdingShift ? 12 : 1) : 0;
          const T2 = heldKeys.s ? (holdingShift ? 12 : 1) : 0;
          const T3 = heldKeys.x ? (holdingShift ? 12 : 1) : 0;
          const t = heldKeys.e ? (holdingShift ? 12 : 1) : 0;
          props.offsetSelectedTranspositions({
            _chromatic: N,
            [props.scaleTracks?.[0]?.id ?? ""]: T1,
            [props.scaleTracks?.[1]?.id ?? ""]: T2,
            [props.scaleTracks?.[2]?.id ?? ""]: T3,
            _self: t,
          });
          if (N || T1 || T2 || T3 || t) return;

          // Select the previous track
          if (!props.selectedTrackId) return;
          const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(props.selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex - 1;
          if (newIndex < 0) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e) || props.showingEditor) return;
          cancelEvent(e);

          // Offset the selected transpositions
          const holdingShift = isHoldingShift(e);
          const N = heldKeys.q ? (holdingShift ? -12 : -1) : 0;
          const T1 = heldKeys.w ? (holdingShift ? -12 : -1) : 0;
          const T2 = heldKeys.s ? (holdingShift ? -12 : -1) : 0;
          const T3 = heldKeys.x ? (holdingShift ? -12 : -1) : 0;
          const t = heldKeys.e ? (holdingShift ? -12 : -1) : 0;
          props.offsetSelectedTranspositions({
            ...{
              _chromatic: N,
              _self: t,
            },
            [props.scaleTracks?.[0]?.id ?? ""]: T1,
            [props.scaleTracks?.[1]?.id ?? ""]: T2,
            [props.scaleTracks?.[2]?.id ?? ""]: T3,
          });
          if (N || T1 || T2 || T3 || t) return;

          // Select the next track
          if (!props.selectedTrackId) return;
          const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(props.selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex + 1;
          if (newIndex >= trackIds.length) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      v: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || props.showingEditor)
            return;
          cancelEvent(e);
          props.pasteClipsAndTranspositions(props.rows);
        },
      },
    },
    [
      props.selectedTrackId,
      props.scaleTracks,
      props.rows,
      props.showingEditor,
      heldKeys,
    ]
  );

  return null;
}
