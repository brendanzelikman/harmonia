import { EditorTooltipButton } from "components/TooltipButton";
import { EditorTabGroup } from "features/Editor/components/EditorTab";
import {
  BsPencilFill,
  BsEraserFill,
  BsTrash,
  BsCursorFill,
  BsArrowUp,
  BsArrowDown,
  BsArrowLeft,
  BsArrowRight,
} from "react-icons/bs";
import { ScaleEditorProps } from "../ScaleEditor";
import classNames from "classnames";
import { useProjectDispatch } from "types/hooks";
import { toggleEditorAction } from "types/Editor/EditorSlice";
import {
  clearScale,
  transposeScale,
  rotateScale,
} from "types/Scale/ScaleThunks";

export const ScaleEditorMenu = (props: ScaleEditorProps) => {
  const dispatch = useProjectDispatch();
  const { isAdding, isRemoving, isEmpty, cursor } = props;

  /** The user can add notes to the scale. */
  const AddButton = () => (
    <EditorTooltipButton
      label={`${isAdding ? "Stop Adding" : "Add Notes"}`}
      className={classNames(
        `rounded-full`,
        isAdding ? "text-sky-400" : "text-slate-200"
      )}
      onClick={() => dispatch(toggleEditorAction({ data: "addingNotes" }))}
    >
      <BsPencilFill className="text-lg" />
    </EditorTooltipButton>
  );

  /** The user can remove notes from the scale. */
  const RemoveButton = () => (
    <EditorTooltipButton
      label={`${isRemoving ? "Stop Removing" : "Remove Notes"}`}
      className={classNames(
        "rounded-full",
        isEmpty
          ? "text-slate-500"
          : isRemoving
          ? "text-red-400"
          : "text-slate-200"
      )}
      disabled={isEmpty}
      onClick={() => dispatch(toggleEditorAction({ data: "removingNotes" }))}
    >
      <BsEraserFill className="text-lg" />
    </EditorTooltipButton>
  );

  /** The user can toggle the cursor to show notes. */
  const CursorButton = () => (
    <EditorTooltipButton
      label={cursor.hidden ? "Show Cursor" : "Hide Cursor"}
      className={classNames(
        "rounded-full",
        cursor.hidden
          ? isEmpty
            ? "text-slate-500"
            : "text-slate-200"
          : "text-emerald-500"
      )}
      disabled={isEmpty}
      onClick={() => cursor.toggle()}
    >
      <BsCursorFill className="text-lg" />
    </EditorTooltipButton>
  );

  /** The user can clear the notes of the scale. */
  const ClearButton = () => (
    <EditorTooltipButton
      label="Clear Scale"
      className={classNames(
        "rounded-full",
        isEmpty ? "text-slate-500" : "active:text-red-400"
      )}
      disabled={isEmpty}
      onClick={() => dispatch(clearScale(props.scale?.id))}
    >
      <BsTrash className="text-lg" />
    </EditorTooltipButton>
  );

  /** The user can transpose the scale up one step. */
  const TransposeUpButton = () => (
    <EditorTooltipButton
      className="rounded-full"
      label="Transpose Scale Up"
      onClick={() => dispatch(transposeScale(props.scale, 1))}
      disabled={isEmpty}
    >
      <BsArrowUp />
    </EditorTooltipButton>
  );

  /** The user can transpose the scale down one step. */
  const TransposeDownButton = () => (
    <EditorTooltipButton
      className="rounded-full"
      label="Transpose Scale Down"
      onClick={() => dispatch(transposeScale(props.scale, -1))}
      disabled={isEmpty}
    >
      <BsArrowDown />
    </EditorTooltipButton>
  );

  /** The user can rotate the scale up one step. */
  const RotateUpButton = () => (
    <EditorTooltipButton
      className="rounded-full"
      label="Rotate Scale Up"
      onClick={() => dispatch(rotateScale(props.scale, 1))}
      disabled={isEmpty}
    >
      <BsArrowRight />
    </EditorTooltipButton>
  );

  /** The user can rotate the scale down one step. */
  const RotateDownButton = () => (
    <EditorTooltipButton
      className="rounded-full"
      label="Rotate Scale Down"
      onClick={() => dispatch(rotateScale(props.scale, -1))}
      disabled={isEmpty}
    >
      <BsArrowLeft />
    </EditorTooltipButton>
  );

  return (
    <div className="h-14 mt-4 flex items-center bg-slate-900/80 rounded border border-sky-500">
      <EditorTabGroup border={true}>
        <span className="text-sky-400 font-thin">Score:</span>

        <AddButton />
        <RemoveButton />
        <CursorButton />
        <ClearButton />
      </EditorTabGroup>
      <EditorTabGroup border>
        <span className="text-fuchsia-300 font-thin">Transpose:</span>
        <TransposeUpButton />
        <TransposeDownButton />
      </EditorTabGroup>
      <EditorTabGroup border={props.isActive}>
        <span className="text-fuchsia-300 font-thin">Rotate:</span>
        <RotateDownButton />
        <RotateUpButton />
      </EditorTabGroup>
      {props.isActive && (
        <EditorTabGroup>
          <span
            className={classNames(
              "font-thin",
              isAdding
                ? "text-sky-400"
                : isRemoving
                ? "text-red-400"
                : "text-slate-400"
            )}
          >
            {isAdding
              ? "Play Piano to Add Note"
              : isRemoving
              ? "Play Piano or Click Note to Remove"
              : "Playing Notes"}
          </span>
        </EditorTabGroup>
      )}
    </div>
  );
};
