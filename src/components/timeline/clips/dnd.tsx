import { inRange, union } from "lodash";
import { useDrag } from "react-dnd";
import { useAppSelector } from "redux/hooks";
import { selectClips, selectSelectedClipIds } from "redux/selectors";
import { Clip } from "types/clips";
import { Transform } from "types/transform";
import { ClipProps } from "./Clip";

interface DropResult {
  dropEffect: string;
}

export function useClipDrag(props: ClipProps) {
  const selectedClipIds = useAppSelector(selectSelectedClipIds);
  const clips = useAppSelector(selectClips);
  const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
  const transforms = props.transforms;
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
        const clip = clips.find((clip) => clip.id === item.clip?.id);
        if (!clip) return;

        // Compute the offset of the drag
        const rowOffset = item.hoveringRow - item.rowIndex;
        const colOffset = item.hoveringColumn - 1 - clip.startTime;

        // Compute the set of clips to move
        const clipIds = union(selectedClipIds, [item.clip.id]);

        const dropResult = monitor.getDropResult() as DropResult;

        // Get the new row + track
        const trackIndex = trackIds.indexOf(clip.trackId);
        if (trackIndex === -1) return;
        const newRow = trackIndex + rowOffset;
        const newTrackId = props.rows[newRow].trackId;
        if (newTrackId === undefined) return;

        // Compute the new array of clips
        let newClips: Clip[] = [];
        let newTransforms: Transform[] = [];
        for (const clipId of clipIds) {
          // Get the clip
          const clip = clips.find((clip) => clip.id === clipId);
          if (clip) {
            // Get the new row + track
            const trackIndex = trackIds.indexOf(clip.trackId);
            if (trackIndex === -1) return;
            const newRow = trackIndex + rowOffset;
            if (!props.rows[newRow]) return;
            if (props.rows[newRow].trackId === undefined) return;
            if (props.rows[newRow].type !== "patternTrack") return;
            const newTrackId = props.rows[newRow].trackId;
            if (newTrackId === undefined) return;

            const newStartTime = Math.max(clip.startTime + colOffset, 0);
            // Move or copy the clip based on the drag effect
            if (dropResult?.dropEffect === "move") {
              // Get the new track
              newClips.push({
                ...clip,
                id: clipId,
                trackId: newTrackId,
                startTime: newStartTime,
              });
            } else {
              newClips.push({
                ...clip,
                trackId: newTrackId,
                startTime: newStartTime,
              });
            }
            // Push the transforms
            const clipTransforms = transforms.filter(
              (t) =>
                t.trackId === clip.trackId &&
                inRange(t.time, clip.startTime, clip.startTime + props.duration)
            );
            clipTransforms.forEach((t) => {
              newTransforms.push({
                ...t,
                trackId: newTrackId,
                time: t.time + colOffset,
              });
            });
          }
        }
        if (dropResult?.dropEffect === "copy") {
          if (newTransforms.length) {
            props
              .createClipsAndTransforms(newClips, newTransforms)
              .then(({ clipIds }) => {
                props.selectClips(clipIds);
              });
          } else {
            props.createClips(newClips).then(({ clipIds }) => {
              props.selectClips(clipIds);
            });
          }
        } else {
          if (newTransforms.length) {
            props.updateClipsAndTransforms(newClips, newTransforms);
          } else {
            props.updateClips(newClips);
          }
        }

        //   clipIds.then((res: any) => {
        //     const ids: ClipId[] = JSON.parse(res);
        //     const newIds = ids.filter((id) => !selectedClipIds.includes(id));
        //     props.selectClips(newIds);
        //     if (newTransforms.length) props.createTransforms(newTransforms);
        //   });
        // } else {
        //   props.updateClips(newClips);
        //   if (newTransforms.length) props.updateTransforms(newTransforms);
        // }
      },
    }),
    [selectedClipIds, clips, trackIds, transforms]
  );
}
