import { useDrag } from "react-dnd";
import { Clip } from "types/Clip";
import { Transposition } from "types/Transposition";
import { ClipProps } from "./Clip";
import { subdivisionToTicks, ticksToColumns } from "utils";

interface DropResult {
  dropEffect: string;
}

export function useClipDrag(props: ClipProps) {
  return useDrag(
    () => ({
      type: "clip",
      item: {
        clip: props.clip,
        trackId: props.clip.trackId,
        rowIndex: props.index,
      },
      collect(monitor) {
        return {
          isDragging: monitor.isDragging(),
        };
      },
      end: (item: any, monitor: any) => {
        if (!item.canDrop) return;

        // Find the corresponding clip
        const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
        const clip = props.clips.find((clip) => clip.id === item.clip?.id);
        if (!clip) return;

        // Compute the offset of the drag
        const rowOffset = item.hoveringRow - item.rowIndex;
        const clipCol = ticksToColumns(clip.tick, props.subdivision);
        const colOffset = item.hoveringColumn - clipCol - 1;
        const tickOffset = colOffset * subdivisionToTicks(props.subdivision);

        // Get the drop result
        const dropResult = monitor.getDropResult() as DropResult;
        const copying = dropResult?.dropEffect === "copy";

        // Get the selected media
        const selectedClips = props.selectedClips.includes(clip)
          ? props.selectedClips
          : [clip];

        // Compute the new array of clips
        let newClips: Clip[] = [];
        let newTranspositions: Transposition[] = [];

        // Iterate over the selected clips
        for (const clip of selectedClips) {
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
        for (const transposition of props.selectedTranspositions) {
          if (!transposition) return;

          // Get the index of the new track
          const trackIndex = trackIds.indexOf(transposition.trackId);
          if (trackIndex === -1) return;

          // Get the new track
          const newIndex = trackIndex + rowOffset;
          const newTrack = props.rows[newIndex];
          if (!newTrack?.trackId) return;

          // Compute the new transposition
          newTranspositions.push({
            ...transposition,
            trackId: newTrack.trackId,
            tick: transposition.tick + tickOffset,
          });
        }

        // Make sure the entire operation is valid
        if (newClips.some(({ tick }) => tick < 0)) return;
        if (newTranspositions.some(({ tick }) => tick < 0)) return;

        // If not copying, update the media
        if (!copying) {
          props.updateMedia(newClips, newTranspositions);
          return;
        }

        // Otherwise, create the new media
        props
          .createMedia(newClips, newTranspositions)
          .then(({ clipIds, transpositionIds }) => {
            if (clipIds.length) props.selectClips(clipIds);
            if (transpositionIds.length)
              props.selectTranspositions(transpositionIds);
          });
      },
    }),
    [props.clip, props.rows, props.selectedClips, props.selectedTranspositions]
  );
}
