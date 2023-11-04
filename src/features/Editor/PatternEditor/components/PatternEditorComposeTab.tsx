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
  setEditorNoteDuration,
  toggleEditorAction,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
} from "redux/Editor";
import { clearPattern } from "redux/Pattern";
import { Editor } from "features/Editor/components";
import {
  STRAIGHT_DURATION_TYPES,
  getDurationFromType,
  getDurationImage,
  getDurationName,
  getStraightDuration,
  isDottedDuration,
  isTripletDuration,
} from "utils/durations";
import classNames from "classnames";

export function PatternEditorComposeTab(props: PatternEditorProps) {
  const { dispatch, pattern, cursor, Button } = props;
  const { isInserting, isCustom, isEmpty } = props;

  const isAdding = props.isAdding && cursor.hidden;
  const isEditing = props.isAdding && !cursor.hidden;
  const isActive = isAdding || isEditing || isInserting;

  // ------------------------------------------------------------
  // Cursor/Action Buttons
  // ------------------------------------------------------------

  /** The user can add notes to the pattern or update a specific block. */
  const AddButton = () => {
    const content = isAdding
      ? "Stop Adding"
      : isEditing
      ? "Stop Editing"
      : isInserting
      ? "Start Editing"
      : cursor.hidden
      ? "Add Notes"
      : "Edit Notes";
    return (
      <Button
        label={content}
        content={content}
        active={isActive}
        activeClass="text-emerald-500 animate-pulse"
        onClick={() => dispatch(toggleEditorAction("addingNotes"))}
      >
        {isInserting ? (
          <BsPlusCircleFill className="text-lg text-teal-500" />
        ) : !cursor.hidden ? (
          <BsPencilFill className="text-lg" />
        ) : (
          <BsBrushFill className="text-lg" />
        )}
      </Button>
    );
  };

  /** The user can show/hide a cursor and navigate the score. */
  const CursorButton = () => (
    <Button
      label={`${cursor.hidden ? "Show" : "Hide"} Cursor`}
      onClick={cursor.toggle}
      active={!cursor.hidden}
      activeClass="text-emerald-500/80"
      disabled={isEmpty}
      disabledClass="text-slate-500"
    >
      <BsCursorFill className="text-lg" />
    </Button>
  );

  /** The user can insert notes by anchoring the cursor. */
  const InsertButton = () => (
    <Button
      label={`${isInserting ? "Stop Inserting" : "Insert Notes"}`}
      active={isInserting}
      activeClass="text-teal-400"
      disabled={!isCustom || cursor.hidden}
      disabledClass="text-slate-500"
      onClick={() => dispatch(toggleEditorAction("insertingNotes"))}
    >
      <BiAnchor className="text-lg" />
    </Button>
  );

  /** The user can erase the current note selected by the cursor. */
  const EraseButton = () => (
    <Button
      label="Erase Note"
      weakClass="active:text-red-500"
      onClick={props.onEraseClick}
      disabled={!isCustom || isEmpty}
      disabledClass="text-slate-500"
    >
      <BsEraserFill className="text-lg" />
    </Button>
  );

  /** The user can clear the notes of the pattern. */
  const ClearButton = () => (
    <Button
      label="Clear Pattern"
      weakClass="active:bg-gray-500"
      onClick={() => pattern && dispatch(clearPattern(pattern?.id))}
      disabled={!isCustom || isEmpty}
      disabledClass="text-slate-500"
    >
      <BsTrash className="text-lg" />
    </Button>
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
  const isNoteDisabled = !isCustom || !isActive;

  /** The user can click to add/insert/update a note with the current duration. */
  const NoteButton = () => {
    const content = `${noteAction} ${durationName}`;
    const isWhole = durationType === "whole";
    const padding = isWhole ? "py-1.5 mt-2" : "py-0.5";
    const filter = isNoteDisabled ? "invert-[60%]" : "invert";
    const noteClass = `object-contain h-full ${padding} ${filter}`;
    return (
      <Button
        padding={false}
        label={content}
        className="w-6"
        weakClass="active:bg-slate-500 active:ring-2 active:ring-slate-500"
        onClick={props.onBlockClick}
        disabled={isNoteDisabled}
      >
        <img src={getDurationImage(durationType)} className={noteClass} />
      </Button>
    );
  };

  /** The user can click to add/insert/update a rest with the current duration. */
  const RestButton = () => {
    const content = `${noteAction} Rest`;
    const invert = isNoteDisabled ? "invert-[60%]" : "invert";
    return (
      <Button
        padding={false}
        label={content}
        className="w-8"
        weakClass="active:bg-slate-500 active:ring-2 active:ring-slate-500"
        onClick={props.onRestClick}
        disabled={isNoteDisabled}
      >
        <img className={`object-contain h-full ${invert}`} src={restNote} />
      </Button>
    );
  };

  /** The user can select the duration of a note with a dropdown menu. */
  const DurationButton = () => {
    const options = STRAIGHT_DURATION_TYPES.map((d, i) => {
      const name = getDurationName(d);
      const typedDuration = getDurationFromType(d, durationType);
      return {
        label: `${name} (${i + 1})`,
        onClick: () => dispatch(setEditorNoteDuration(typedDuration)),
      };
    });
    return (
      <Button
        border
        label="Select Note Duration"
        className="w-16 capitalize"
        options={options}
      >
        {getStraightDuration(durationType)}
      </Button>
    );
  };

  /** The user can toggle the duration as dotted. */
  const DottedButton = () => (
    <Button
      label="Toggle Dotted Note"
      className={classNames("border", {
        "border-emerald-500 text-emerald-500": isDotted,
        "border-slate-500 text-white": !isDotted,
      })}
      onClick={() => dispatch(toggleEditorDottedDuration())}
    >
      Dotted
    </Button>
  );

  /** The user can toggle the duration as triplet. */
  const TripletButton = () => (
    <Button
      label="Toggle Triplet Note"
      className={classNames("border", {
        "border-emerald-500 text-emerald-500": isTriplet,
        "border-slate-500 text-white": !isTriplet,
      })}
      onClick={() => dispatch(toggleEditorTripletDuration())}
    >
      Triplet
    </Button>
  );

  return (
    <Editor.Tab show={props.isCustom} border={false}>
      <Editor.TabGroup border={true}>
        <AddButton />
        <CursorButton />
        <InsertButton />
        <EraseButton />
        <ClearButton />
      </Editor.TabGroup>
      <Editor.TabGroup>
        <NoteButton />
        <RestButton />
        <DurationButton />
        <DottedButton />
        <TripletButton />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
