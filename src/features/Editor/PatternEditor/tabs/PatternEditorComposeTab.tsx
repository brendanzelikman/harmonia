import { BiAnchor } from "react-icons/bi";
import {
  BsBrushFill,
  BsPencilFill,
  BsTrash,
  BsCursorFill,
  BsEraserFill,
  BsPlusCircleFill,
} from "react-icons/bs";
import { PatternEditorProps } from "../PatternEditor";
import restNote from "assets/noteheads/rest.png";
import { useMemo } from "react";
import {
  STRAIGHT_DURATION_TYPES,
  getDurationFromType,
  getDurationImage,
  getDurationKey,
  getDurationName,
  getStraightDuration,
  isDottedDuration,
  isTripletDuration,
} from "utils/durations";
import classNames from "classnames";
import { EditorTooltipButton } from "components/TooltipButton";
import { EditorTabGroup } from "features/Editor/components/EditorTab";
import {
  toggleEditorAction,
  setEditorNoteDuration,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
} from "types/Editor/EditorSlice";
import { useProjectDispatch } from "types/hooks";
import { clearPattern } from "types/Pattern/PatternThunks";

export function PatternEditorComposeTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern, cursor } = props;
  const { isInserting, isCustom, isEmpty } = props;

  const isAdding = props.isAdding && cursor.hidden;
  const isEditing = props.isAdding && !cursor.hidden;
  const isActive = isAdding || isEditing || isInserting;

  /** The user can add notes to the pattern or update a specific block. */
  const AddButton = () => {
    const content = isAdding
      ? "Stop Adding Notes"
      : isEditing
      ? "Stop Editing Block"
      : isInserting
      ? "Start Editing Block"
      : cursor.hidden
      ? "Start Adding Notes"
      : "Start Editing Block";
    return (
      <EditorTooltipButton
        className={`rounded-full ${isActive ? "text-emerald-400" : ""}`}
        label={content}
        onClick={() => dispatch(toggleEditorAction({ data: "addingNotes" }))}
        keepTooltipOnClick
      >
        {isInserting ? (
          <BsPlusCircleFill className="text-lg text-teal-400" />
        ) : !cursor.hidden ? (
          <BsPencilFill />
        ) : (
          <BsBrushFill />
        )}
      </EditorTooltipButton>
    );
  };

  /** The user can show/hide a cursor and navigate the score. */
  const CursorButton = () => (
    <EditorTooltipButton
      label={
        cursor.hidden ? `Select Block #${cursor.index + 1}` : "Hide The Cursor"
      }
      onClick={cursor.toggle}
      className={`rounded-full ${!cursor.hidden ? "text-emerald-400" : ""}`}
      disabled={isEmpty}
      disabledClass="text-slate-500"
      keepTooltipOnClick
    >
      <BsCursorFill />
    </EditorTooltipButton>
  );

  /** The user can insert notes by anchoring the cursor. */
  const InsertButton = () => (
    <EditorTooltipButton
      label={`${
        isInserting
          ? "Stop Inserting"
          : `Insert After Block #${cursor.index + 1}`
      }`}
      className={`rounded-full ${
        isInserting && isCustom && !cursor.hidden ? "text-teal-500" : ""
      }`}
      disabled={!isCustom || cursor.hidden}
      disabledClass="text-slate-500"
      onClick={() => dispatch(toggleEditorAction({ data: "insertingNotes" }))}
      keepTooltipOnClick
    >
      <BiAnchor />
    </EditorTooltipButton>
  );

  /** The user can erase the current note selected by the cursor. */
  const EraseButton = () => (
    <EditorTooltipButton
      label={cursor.hidden ? "Erase Last Block" : "Erase Selected Block"}
      className={`rounded-full ${
        !isCustom && !isEmpty ? "active:text-red-500" : ""
      }`}
      onClick={props.onEraseClick}
      disabled={!isCustom || isEmpty}
      disabledClass="text-slate-500"
    >
      <BsEraserFill />
    </EditorTooltipButton>
  );

  /** The user can clear the notes of the pattern. */
  const ClearButton = () => (
    <EditorTooltipButton
      label="Erase All Notes"
      className={`rounded-full ${
        isCustom && !isEmpty ? "active:bg-gray-500" : ""
      }`}
      onClick={() => pattern && dispatch(clearPattern(pattern?.id))}
      disabled={!isCustom || isEmpty}
      disabledClass="text-slate-500"
    >
      <BsTrash />
    </EditorTooltipButton>
  );

  // ------------------------------------------------------------
  // Note Duration Buttons
  // ------------------------------------------------------------

  // Note action info
  const noteAction = useMemo(() => {
    if (isAdding) return "Add";
    if (isEditing) return "Set to";
    if (isInserting) return "Insert";
    return "Add";
  }, [isAdding, isEditing, isInserting]);

  // Duration info
  const durationType = props.settings.note.duration;
  const durationName = getDurationName(durationType);
  const isDotted = isDottedDuration(durationType);
  const isTriplet = isTripletDuration(durationType);
  const isStraight = !isDotted && !isTriplet;
  const isNoteDisabled = !isCustom || !isActive;

  /** The user can click to add/insert/update a note with the current duration. */
  const NoteButton = () => {
    const content = `${noteAction} ${durationName}`;
    const isWhole = getStraightDuration(durationType) === "whole";
    const isQuarter = getStraightDuration(durationType) === "quarter";
    const is32nd = getStraightDuration(durationType) === "32nd";
    const is64th = getStraightDuration(durationType) === "64th";
    const padding = isWhole
      ? "py-1 mt-2 scale-150"
      : isQuarter
      ? "scale-150"
      : is32nd || is64th
      ? "scale-100"
      : "scale-125";
    const filter = isNoteDisabled ? "invert-[60%]" : "invert";
    return (
      <EditorTooltipButton
        label={content}
        className="rounded-full max-w-8 max-h-8 p-2.5 border border-slate-500 active:bg-emerald-600"
        onClick={props.onBlockClick}
        disabled={isNoteDisabled}
        keepTooltipOnClick
      >
        <img
          src={getDurationImage(durationType)}
          className={`object-contain h-full pointer-events-none select-none ${padding} ${filter}`}
        />
      </EditorTooltipButton>
    );
  };

  /** The user can click to add/insert/update a rest with the current duration. */
  const RestButton = () => {
    const content = `${noteAction} ${durationName.slice(0, -4)} Rest`;
    const invert = isNoteDisabled ? "invert-[60%]" : "invert";
    return (
      <EditorTooltipButton
        label={content}
        className="rounded-full max-w-8 max-h-8 p-1 border border-slate-500 active:bg-slate-600"
        onClick={props.onRestClick}
        disabled={isNoteDisabled}
        keepTooltipOnClick
      >
        <img
          className={`object-contain w-full h-full pointer-events-none select-none ${invert}`}
          src={restNote}
        />
      </EditorTooltipButton>
    );
  };

  /** The user can select the duration of a note with a dropdown menu. */
  const DurationButton = () => {
    const options = STRAIGHT_DURATION_TYPES.map((d, i) => {
      const name = getDurationName(d);
      const typedDuration = getDurationFromType(d, durationType);
      const key = getDurationKey(d);
      return {
        label: `${name} (${key})`,
        onClick: () => dispatch(setEditorNoteDuration({ data: typedDuration })),
      };
    });
    return (
      <EditorTooltipButton
        label="Change Note Duration"
        className="w-24 py-1 text-sm font-semibold rounded-md capitalize border border-emerald-400"
        options={options}
      >
        {/* <Button options={options} /> */}
        {getStraightDuration(durationType)} Note
      </EditorTooltipButton>
    );
  };

  /** The user can toggle the duration as straight. */
  const StraightButton = () => (
    <EditorTooltipButton
      hideRing
      label={`${
        isStraight ? "Selected Straight Note" : "Set to Straight Note"
      }`}
      className={classNames("border text-xs w-16 rounded-l-md", {
        "border-emerald-400 text-slate-50 font-bold": isStraight,
        "border-slate-500 text-white font-thin": !isStraight,
      })}
      onClick={() =>
        dispatch(
          setEditorNoteDuration({ data: getStraightDuration(durationType) })
        )
      }
      keepTooltipOnClick
    >
      Straight
    </EditorTooltipButton>
  );

  /** The user can toggle the duration as dotted. */
  const DottedButton = () => (
    <EditorTooltipButton
      hideRing
      label={`${isDotted ? "Set to Straight Note" : "Set to Dotted Note"}`}
      className={classNames("text-xs w-14 -mx-3", {
        "border border-emerald-400 text-slate-50 font-bold": isDotted,
        "border-y border-slate-500 text-white font-thin": !isDotted,
      })}
      onClick={() => dispatch(toggleEditorDottedDuration())}
      keepTooltipOnClick
    >
      Dotted
    </EditorTooltipButton>
  );

  /** The user can toggle the duration as triplet. */
  const TripletButton = () => (
    <EditorTooltipButton
      hideRing
      label={`${isTriplet ? "Set to Straight Note" : "Set to Triplet Note"}`}
      className={classNames("border text-xs w-14 rounded-r-md", {
        "border-emerald-400 text-slate-50 font-bold": isTriplet,
        "border-slate-500 text-white font-thin": !isTriplet,
      })}
      onClick={() => dispatch(toggleEditorTripletDuration())}
      keepTooltipOnClick
    >
      Triplet
    </EditorTooltipButton>
  );

  const textColor = isAdding
    ? "text-emerald-400"
    : isInserting
    ? "text-teal-400"
    : "text-emerald-400";

  return (
    <>
      <EditorTabGroup border>
        <span className="text-emerald-400 font-thin">Score:</span>
        {AddButton()}
        {EraseButton()}
        {CursorButton()}
        {InsertButton()}
        {ClearButton()}
      </EditorTabGroup>
      <EditorTabGroup border={isActive}>
        <span className="text-emerald-400 font-thin">Duration:</span>
        {StraightButton()}
        {DottedButton()}
        {TripletButton()}
        {DurationButton()}
      </EditorTabGroup>
      {isActive && (
        <EditorTabGroup>
          <span className={`${textColor} font-thin whitespace-nowrap`}>
            {isInserting
              ? "Insert Note"
              : isAdding
              ? "Input Note"
              : "Set Duration"}
            {": "}
          </span>
          {NoteButton()}
          {RestButton()}
        </EditorTabGroup>
      )}
    </>
  );
}
