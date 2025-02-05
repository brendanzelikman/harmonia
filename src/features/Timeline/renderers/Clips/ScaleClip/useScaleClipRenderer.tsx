import { useCallback, useMemo } from "react";
import { useClipDrag } from "../useClipDnd";
import {
  useProjectDispatch,
  useProjectSelector as use,
  useDeep,
} from "types/hooks";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { POSE_HEIGHT } from "utils/constants";
import classNames from "classnames";
import { ClipComponentProps } from "../TimelineClips";
import { isFiniteNumber } from "types/util";
import {
  selectScaleName,
  selectTrackTop,
} from "types/Arrangement/ArrangementTrackSelectors";
import {
  PortaledScaleClip,
  PortaledScaleClipId,
  ScaleClipId,
} from "types/Clip/ClipTypes";
import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import {
  selectCellWidth,
  selectTimelineTickLeft,
  selectTrackHeight,
  selectIsAddingClips,
  selectIsClipSelected,
} from "types/Timeline/TimelineSelectors";
import {
  selectTrackById,
  selectTrackMidiScale,
  selectTrackScale,
  selectTrackScaleChain,
} from "types/Track/TrackSelectors";
import { getScaleNoteDegree, getScaleNotes } from "types/Scale/ScaleFunctions";
import { selectCustomScaleById } from "types/Scale/ScaleSelectors";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { useDragState } from "types/Media/MediaTypes";
import { createSelectedPortaledClipById } from "types/Arrangement/ArrangementSelectors";
import { cancelEvent, promptUserForString } from "utils/html";
import { readMidiScaleFromString } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { updateScale } from "types/Scale/ScaleSlice";
import { getScaleKey, getScaleName } from "utils/scale";
import { getMidiPitchClass } from "utils/midi";
import { convertMidiToNestedNote } from "types/Track/TrackThunks";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { ScaleArray } from "types/Scale/ScaleTypes";

interface ScaleClipRenderer extends ClipComponentProps {
  id: ScaleClipId;
  pcId: PortaledScaleClipId;
}

export function ScaleClipRenderer(props: ScaleClipRenderer) {
  const { id, pcId, isPortaling, holdingI } = props;
  const { isAdding, isSlicing } = props;
  const selectClip = useMemo(
    () => createSelectedPortaledClipById(pcId),
    [pcId]
  );
  const clip = useDeep(selectClip) as PortaledScaleClip;
  const { tick } = clip;
  const isSelected = use((_) => selectIsClipSelected(_, id));
  const dispatch = useProjectDispatch();
  const cellWidth = use(selectCellWidth);
  const clipTrack = useDeep((_) => selectTrackById(_, clip.trackId));
  const trackScale = useDeep((_) => selectTrackMidiScale(_, clip.trackId));
  const trackSize = getScaleNotes(trackScale).length;
  const clipScale = useDeep((_) => selectCustomScaleById(_, clip.scaleId));
  const clipSize = getScaleNotes(clipScale).length;
  const isEqualSize = trackSize === clipSize;

  /** A custom hook for dragging poses into cells */
  const [_, drag] = useClipDrag({
    id: pcId as ScaleClipId,
    type: "scale",
    startDrag: props.startDrag,
    endDrag: props.endDrag,
  });

  const dragState = useDragState();
  const draggingPatternClip = dragState.draggingPatternClip;
  const draggingPoseClip = dragState.draggingPoseClip;
  const draggingPortal = dragState.draggingPortal;

  // Timeline info
  const addingSomeMedia = use(selectIsAddingClips);
  const isActive = addingSomeMedia;
  const isDraggingOther =
    draggingPatternClip || draggingPoseClip || draggingPortal;

  // Pose dimensions
  const top = use((_) => selectTrackTop(_, clip.trackId));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectClipWidth(_, clip));
  const height = use((_) => selectTrackHeight(_, clip.trackId));

  /** The pose header contains a clip name and vector if it is a bucket. */
  const name = use((_) => selectScaleName(_, clip?.scaleId));
  const isInfinite = !isFiniteNumber(clip.duration);

  const Header = useCallback(() => {
    // The icon is a star wand when selected, magic wand otherwise
    const IconType = isSelected ? SlMagicWand : BsMagic;

    // The label is more visible when selected
    const wrapperClass = classNames(
      "flex text-sm group shrink-0 relative items-center whitespace-nowrap pointer-events-none font-nunito",
      "gap-2 animate-in fade-in duration-75",
      isSelected ? "text-white font-semibold" : "text-white/80 font-light"
    );

    // The pose height refers to the notch above the clip
    const height = POSE_HEIGHT;

    return (
      <div className={wrapperClass} style={{ height }} draggable>
        <IconType className="flex shrink-0 ml-1 w-4 h-4 select-none" />
        <div className="group-hover:block hidden">{name}</div>
      </div>
    );
  }, [isSelected, name]);

  /** The pose body is filled in behind a clip. */
  const Body = () => (
    <div
      className={`w-full p-1 bg-sky-700 flex flex-col overflow-scroll items-center animate-in fade-in text-[9px] flex-nowrap text-white duration-75 flex-grow`}
    >
      {pitchClasses.map((pc, i) => (
        <div key={`${pc}${i}`}>{pc}</div>
      ))}
    </div>
  );

  // Assemble the classname
  const className = classNames(
    props.className,
    "flex flex-col border bg-blue-500 rounded overflow-hidden",
    isSelected ? "border-white " : "border-slate-400",
    { "cursor-scissors": isSlicing },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": holdingI },
    { "cursor-pointer": !holdingI && !isAdding },
    { "hover:animate-pulse hover:ring hover:ring-blue-400": isAdding },
    isActive || isDraggingOther || isPortaling
      ? "pointer-events-none"
      : isInfinite && isAdding
      ? "pointer-events-none"
      : "pointer-events-all",
    !isEqualSize
      ? "opacity-85"
      : isPortaling || isDraggingOther
      ? "opacity-75"
      : "opacity-100"
  );

  const scaleNotes = clipScale.notes;
  const scales = useDeep((_) => selectTrackScaleChain(_, clip.trackId));
  const midi = resolveScaleChainToMidi([...scales.slice(0, -1), scaleNotes]);
  const scaleName = getScaleName(midi);
  const pitchClasses = midi.map((MIDI) =>
    getMidiPitchClass(MIDI, getScaleKey(midi))
  );
  const isEmpty = !midi.length;
  // Render the pose clip
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width: isInfinite ? cellWidth : width, height }}
      onClick={(e) =>
        dispatch(onClipClick(e, { ...clip, id }, { eyedropping: holdingI }))
      }
      onDoubleClick={(e) => {
        cancelEvent(e);
        promptUserForString({
          title: "Update Scale Clip",
          description: isEmpty
            ? [
                `This scale clip is empty.`,
                `Please input a scale by name, note, or number.`,
              ]
            : [
                `The current scale of this clip is ${scaleName}`,
                `= (${midi.join(", ")})`,
                `= (${pitchClasses.join(", ")})`,
                `It is currently ${
                  isEqualSize
                    ? "active because the scales are the same size."
                    : "inactive because the scales are not the same size."
                }`,
              ],
          callback: (value) => {
            const input = readMidiScaleFromString(value, midi);
            if (!input?.length) return;
            let notes: ScaleArray = input;
            if (clipTrack?.parentId) {
              notes = input.map((MIDI) =>
                dispatch(convertMidiToNestedNote(MIDI, clipTrack.parentId))
              );
              if (notes.some((note) => getScaleNoteDegree(note) === -1)) {
                notes = input;
              }
            }
            dispatch(updateScale({ id: clip.scaleId, notes }));
          },
        })();
      }}
    >
      {Header()}
      {Body()}
    </div>
  );
}
