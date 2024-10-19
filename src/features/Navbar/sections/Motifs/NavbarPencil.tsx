import { BsPencil } from "react-icons/bs";
import { use, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import { hideEditor } from "types/Editor/EditorSlice";
import { selectIsSelectedEditorOpen } from "types/Editor/EditorSelectors";
import {
  selectSelectedMotif,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { selectSelectedMotifName } from "types/Arrangement/ArrangementScaleSelectors";
import { showEditor } from "types/Editor/EditorThunks";
import {
  toolkitMotifBackground,
  toolkitMotifBorder,
  toolkitMotifText,
} from "features/Navbar/components/NavbarStyles";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

export const NavbarPencil = () => {
  const dispatch = useProjectDispatch();
  const type = use(selectTimelineType);
  const name = use(selectSelectedMotifName);
  const motif = use(selectSelectedMotif);
  const active = use(selectIsSelectedEditorOpen);
  const disabled = motif === undefined;

  return (
    <div className="relative group/tooltip" id={`${type}-editor-button`}>
      <div
        className={classNames(
          toolkitMotifBackground[type],
          `border-slate-400/50 transition-all`,
          "size-8 xl:size-9 flex total-center rounded-full",
          disabled ? "cursor-default opacity-75" : "cursor-pointer opacity-100",
          disabled
            ? ""
            : active
            ? `ring-2 ring-offset-2 ring-offset-black ${motifRingColor[type]}`
            : "hover:ring-2 hover:ring-slate-300"
        )}
        onClick={() =>
          disabled
            ? null
            : active
            ? dispatch(hideEditor())
            : dispatch(showEditor({ data: { view: type } }))
        }
      >
        <BsPencil className="text-lg" />
      </div>
      {!disabled && (
        <NavbarHoverTooltip
          className="-left-12 whitespace-nowrap"
          borderColor={toolkitMotifBorder[type]}
          padding="px-3 py-2"
        >
          <span className={active ? toolkitMotifText[type] : ""}>
            {active ? "Editing" : "Edit"}{" "}
            <span className="font-bold">{name}</span>
          </span>
        </NavbarHoverTooltip>
      )}
    </div>
  );
};

const motifRingColor = {
  pattern: "ring-emerald-600/80",
  pose: "ring-pink-400/80",
  scale: "ring-sky-400/80",
};
