import { useDrag } from "react-dnd";
import { Clip } from "types/clip";
import { Transposition } from "types/transposition";
import { TranspositionProps } from "./Transposition";
import { subdivisionToTicks, ticksToColumns } from "utils";

interface DropResult {
  dropEffect: string;
}

export function useTranspositionDrag(props: TranspositionProps) {
  return useDrag(
    () => ({
      type: "transposition",
      item: {
        transposition: props.transposition,
        trackId: props.transposition.trackId,
        rowIndex: props.index,
      },
      collect(monitor) {
        return {
          isDragging: monitor.isDragging(),
        };
      },
      end: (item: any, monitor: any) => {
        if (!item.canDrop) return;
        const { transpositions, subdivision, selectedTranspositions } = props;

        // Find the corresponding transposition
        const itemId = item.transposition?.id;
        const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
        const transposition = transpositions.find(({ id }) => id === itemId);
        if (!transposition) return;

        // Compute the offset of the drag
        const rowOffset = item.hoveringRow - item.rowIndex;
        const columns = ticksToColumns(transposition.tick, subdivision);
        const colOffset = item.hoveringColumn - columns - 1;
        const tickOffset = colOffset * subdivisionToTicks(subdivision);

        // Get the drop result
        const dropResult = monitor.getDropResult() as DropResult;
        const copying = dropResult?.dropEffect === "copy";

        // Compute the new array of clips
        let newClips: Clip[] = [];
        let newTranspositions: Transposition[] = [];

        // Iterate over the selected clips
        for (const clip of props.selectedClips) {
          if (!clip) return;

          // Get the index of the new track
          const trackIndex = trackIds.indexOf(clip.trackId);
          if (trackIndex === -1) return;

          // Get the new track
          const newIndex = trackIndex + rowOffset;
          const newTrack = props.rows[newIndex];
          if (!newTrack?.trackId || newTrack.type !== "patternTrack") return;

          // Compute the new clip
          newClips.push({
            ...clip,
            trackId: newTrack.trackId,
            tick: clip.tick + tickOffset,
          });
        }

        // Iterate over the selected transpositions
        const selectedItems = selectedTranspositions.includes(transposition)
          ? selectedTranspositions
          : [transposition];

        for (const transposition of selectedItems) {
          if (!transposition) return;

          // Get the index of the new track
          const trackIndex = trackIds.indexOf(transposition.trackId);
          if (trackIndex === -1) return;

          // Get the new track
          const newIndex = trackIndex + rowOffset;
          const newTrack = props.rows[newIndex];
          const { trackId } = newTrack;
          if (!trackId) return;

          // Compute the new transposition
          newTranspositions.push({
            ...transposition,
            trackId,
            tick: transposition.tick + tickOffset,
          });
        }

        // Make sure the entire operation is valid
        if (newClips.some(({ tick }) => tick < 0)) return;
        if (newTranspositions.some(({ tick }) => tick < 0)) return;

        // If not copying, update the clips and transpositions
        if (!copying) {
          props.updateClipsAndTranspositions(newClips, newTranspositions);
          return;
        }

        // Otherwise, create the new clips and transpositions
        props.createClipsAndTranspositions(newClips, newTranspositions);
      },
    }),
    [props]
  );
}
