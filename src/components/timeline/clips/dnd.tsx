import { useDrag } from "react-dnd";
import { Clip } from "types/clips";
import { Transform } from "types/transform";
import { ClipProps } from "./Clip";
import { subdivisionToTicks, ticksToColumns } from "appUtil";

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

        // Get the selected clips and transforms
        const selectedClips = props.clips.filter(
          (c) => props.selectedClipIds.includes(c.id) || c.id === item.clip.id
        );
        const selectedTransforms = props.transforms.filter((t) =>
          props.selectedTransformIds.includes(t.id)
        );

        // Compute the new array of clips
        let newClips: Clip[] = [];
        let newTransforms: Transform[] = [];

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

        // Iterate over the selected transforms
        for (const transform of selectedTransforms) {
          if (!transform) return;

          // Get the index of the new track
          const trackIndex = trackIds.indexOf(transform.trackId);
          if (trackIndex === -1) return;

          // Get the new track
          const newIndex = trackIndex + rowOffset;
          const newTrack = props.rows[newIndex];
          if (!newTrack?.trackId) return;

          // Compute the new transform
          newTransforms.push({
            ...transform,
            trackId: newTrack.trackId,
            tick: transform.tick + tickOffset,
          });
        }

        // Make sure the entire operation is valid
        if (newClips.some((clip) => clip.tick < 0)) return;
        if (newTransforms.some((transform) => transform.tick < 0)) return;

        // If not copying, update the clips and transforms
        if (!copying) {
          props.updateClipsAndTransforms(newClips, newTransforms);
          return;
        }

        // Otherwise, create the new clips and transforms
        props
          .createClipsAndTransforms(newClips, newTransforms)
          .then(({ clipIds, transformIds }) => {
            if (clipIds.length) props.selectClips(clipIds);
            if (transformIds.length) props.selectTransforms(transformIds);
          });
      },
    }),
    [props]
  );
}