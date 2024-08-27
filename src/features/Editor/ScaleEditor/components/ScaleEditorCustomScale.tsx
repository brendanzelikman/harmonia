import { useRef } from "react";
import { BsSignRailroad, BsTrash } from "react-icons/bs";
import { blurOnEnter, cancelEvent } from "utils/html";
import { ScaleEditorProps } from "../ScaleEditor";
import { useScaleDrop, useScaleDrag } from "../hooks/useScaleEditorDnd";
import classNames from "classnames";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { EditorListItem } from "features/Editor/components/EditorList";
import { updateScale } from "types/Scale/ScaleSlice";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { ScaleObject, ScaleId } from "types/Scale/ScaleTypes";
import { areScalesEqual, areScalesRelated } from "types/Scale/ScaleUtils";
import { selectScaleTrackByScaleId } from "types/Track/TrackSelectors";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { setSelectedScale } from "types/Media/MediaThunks";
import { deleteScale } from "types/Scale/ScaleThunks";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";

export interface CustomScaleProps extends ScaleEditorProps {
  customScale: ScaleObject;
  index: number;
  element?: any;
  moveScale: (dragId: ScaleId, hoverId: ScaleId) => void;
}

export const CustomScale = (props: CustomScaleProps) => {
  const dispatch = useProjectDispatch();
  const { customScale, scale, track } = props;

  const selectedTrackId = useProjectSelector(selectSelectedTrackId);
  const scaleTrack = useProjectSelector((_) =>
    selectScaleTrackByScaleId(_, customScale?.id)
  );
  const isTrackSelected = selectedTrackId === scaleTrack?.id;
  const isTracked = scaleTrack?.scaleId === customScale?.id;
  const onTrack = (track as ScaleTrack)?.scaleId === customScale?.id;
  const isActual = scale?.id === customScale.id;
  const isEqual = areScalesEqual(customScale, scale);
  const isRelated = areScalesRelated(customScale, scale);
  const isNone = !isEqual && !isRelated;

  // Custom scales can be dragged and dropped
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useScaleDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useScaleDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  // Clicking on a custom scale sets the track scale's notes
  const onScaleClick = () => {
    if (!scale) return;

    // If the scale belongs to a scale track, toggle that track
    if (scaleTrack) {
      dispatch(
        setSelectedTrackId({
          data: isTrackSelected ? null : scaleTrack.id,
        })
      );
      return;
    }

    // If a track is selected, update the current scale
    if (track) {
      dispatch(updateScale({ data: { ...scale, notes: customScale.notes } }));
      return;
    }

    // Otherwise, select the custom scale
    dispatch(setSelectedScale({ data: customScale.id }));
  };

  // A custom scale can be deleted
  const DeleteButton = () => (
    <div
      className={`flex total-center w-7 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={() => {
        if (isTracked) {
          dispatch(
            setSelectedTrackId({
              data: isTrackSelected ? null : scaleTrack.id,
            })
          );
        } else {
          dispatch(deleteScale(customScale?.id));
        }
      }}
    >
      {isTracked ? <BsSignRailroad /> : <BsTrash />}
    </div>
  );

  const opacity = isDragging ? "opacity-50" : "opacity-100";
  return (
    <EditorListItem
      className={classNames(opacity, "border-l", {
        "text-indigo-300 border-l-indigo-300": isTracked && onTrack,
        "text-slate-500 border-l-slate-500": isTracked && !onTrack,
        "text-sky-500 border-l-sky-500": isActual,
        "text-sky-200 border-l-sky-200": isEqual,
        "text-cyan-400 border-l-cyan-400": !isEqual && isRelated,
        "text-slate-400 border-l-slate-500/80 hover:border-l-slate-300": isNone,
      })}
      onClick={onScaleClick}
    >
      <div className="relative flex items-center h-8" ref={ref}>
        <input
          disabled={isTracked}
          onDragStart={cancelEvent}
          className={classNames(
            { "select-none pointer-events-none": isTracked },
            `h-full rounded-l p-2`,
            `border border-white/50 focus:border-white/50 focus:ring-0 bg-transparent`,
            `cursor-pointer outline-none overflow-ellipsis whitespace-nowrap`
          )}
          value={customScale.name}
          onChange={(e) =>
            dispatch(
              updateScale({ data: { ...customScale, name: e.target.value } })
            )
          }
          onKeyDown={blurOnEnter}
        />
        <DeleteButton />
      </div>
    </EditorListItem>
  );
};
