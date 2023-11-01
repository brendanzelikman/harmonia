import { Editor } from "features/Editor/components";
import { useRef } from "react";
import { BsTrash } from "react-icons/bs";
import { deleteScale, updateScale } from "redux/Scale";
import * as _ from "types/Scale";
import { blurOnEnter, cancelEvent } from "utils/html";
import { ScaleEditorProps } from "../ScaleEditor";
import { useScaleDrop, useScaleDrag } from "../hooks/useScaleEditorDnd";
import classNames from "classnames";

export interface CustomScaleProps extends ScaleEditorProps {
  customScale: _.ScaleObject;
  index: number;
  element?: any;
  moveScale: (dragId: _.ScaleId, hoverId: _.ScaleId) => void;
}

export const CustomScale = (props: CustomScaleProps) => {
  const { dispatch, customScale, scale } = props;
  const isEqual = _.areScalesEqual(customScale, scale);
  const isRelated = _.areScalesRelated(customScale, scale);
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
    dispatch(updateScale({ ...scale, notes: customScale.notes }));
  };

  // A custom scale can be deleted
  const DeleteButton = () => (
    <div
      className={`flex justify-center items-center w-7 h-full rounded-r text-center font-thin border border-l-0 border-slate-50/50`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(deleteScale(customScale?.id));
      }}
    >
      <BsTrash />
    </div>
  );

  const opacity = isDragging ? "opacity-50" : "opacity-100";
  return (
    <Editor.ListItem
      className={classNames(opacity, "border-l", {
        "text-sky-500 border-l-sky-500": isEqual,
        "text-cyan-400 border-l-cyan-400": !isEqual && isRelated,
        "text-slate-400 border-l-slate-500/80 hover:border-l-slate-300": isNone,
      })}
      onClick={onScaleClick}
    >
      <div className="relative flex items-center h-8" ref={ref}>
        <input
          draggable
          onDragStart={cancelEvent}
          className={`border border-white/50 focus:border-white/50 focus:ring-0 bg-transparent h-full rounded-l p-2 cursor-pointer outline-none overflow-ellipsis whitespace-nowrap`}
          value={customScale.name}
          onChange={(e) =>
            dispatch(updateScale({ ...customScale, name: e.target.value }))
          }
          onKeyDown={blurOnEnter}
        />
        <DeleteButton />
      </div>
    </Editor.ListItem>
  );
};
