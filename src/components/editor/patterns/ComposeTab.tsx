import { BiAnchor } from "react-icons/bi";
import {
  BsBrushFill,
  BsPencilFill,
  BsCursor,
  BsEraser,
  BsTrash,
} from "react-icons/bs";
import { PatternEditorCursorProps } from ".";
import * as Editor from "../Editor";
import restNote from "assets/noteheads/rest.png";
import { Duration, Timing } from "types/units";

interface ComposeTabProps extends PatternEditorCursorProps {
  onRestClick: () => void;
  onEraseClick: () => void;
  onDurationClick: (duration: Duration) => void;
  onTimingClick: (timing: Timing) => void;
}

export default function ComposeTab(props: ComposeTabProps) {
  const { pattern, cursor } = props;
  const adding = props.state === "adding";
  const inserting = props.state === "inserting";

  const AddButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${
        adding
          ? cursor.hidden
            ? "Stop Adding"
            : "Stop Editing"
          : cursor.hidden
          ? "Add Notes"
          : "Edit Note"
      }`}
    >
      <Editor.MenuButton
        className={`px-1 py-2 relative ${
          adding || inserting ? "text-emerald-500" : ""
        }`}
        onClick={() =>
          adding || inserting ? props.clear() : props.setState("adding")
        }
      >
        {inserting ? (
          <BsBrushFill className="text-lg text-teal-500" />
        ) : !cursor.hidden ? (
          <BsPencilFill className="text-lg" />
        ) : (
          <BsBrushFill className="text-lg" />
        )}
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const StraightButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Straight Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          props.noteTiming === "straight" && props.isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600"
            : "cursor-default"
        }`}
        onClick={() => {
          props.onTimingClick("straight");
        }}
      >
        Straight
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DottedButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Dotted Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          props.noteTiming === "dotted" && props.isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600"
            : "cursor-default"
        }`}
        onClick={() => {
          props.onTimingClick(
            props.noteTiming !== "dotted" ? "dotted" : "straight"
          );
        }}
      >
        Dotted
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const TripletButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Triplet Notes`}>
      <Editor.MenuButton
        className={`px-1 ${
          props.noteTiming === "triplet" && props.isCustom
            ? "ring-2 ring-teal-600 cursor-pointer bg-teal-600"
            : "cursor-default"
        }`}
        onClick={() => {
          props.onTimingClick(
            props.noteTiming !== "triplet" ? "triplet" : "straight"
          );
        }}
      >
        Triplet
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const CursorButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${cursor.hidden ? "Show" : "Hide"} Cursor`}
    >
      <Editor.MenuButton
        onClick={cursor.hidden ? cursor.show : cursor.hide}
        className={`p-1 ${cursor.hidden ? "" : "bg-emerald-500/80"}`}
        disabled={props.isEmpty}
        disabledClass={"px-1"}
      >
        <BsCursor className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const InsertButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${inserting ? "Stop Inserting" : "Insert Note"}`}
    >
      <Editor.MenuButton
        className={`px-1 ${inserting ? "bg-teal-500/80" : ""}`}
        disabled={!props.isCustom || cursor.hidden}
        disabledClass="px-1"
        onClick={() =>
          inserting ? props.setState("adding") : props.setState("inserting")
        }
      >
        <BiAnchor className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const EraseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Erase Note`}>
      <Editor.MenuButton
        className="px-1 active:bg-red-500"
        onClick={props.onEraseClick}
        disabled={!props.isCustom || props.isEmpty || cursor.hidden}
        disabledClass="px-1"
      >
        <BsEraser className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ClearButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Clear Pattern`}>
      <Editor.MenuButton
        className="px-1 active:bg-gray-500"
        onClick={() => props.clearPattern(pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        <BsTrash className="text-lg" />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RestButton = () => (
    <Editor.Tooltip
      show={props.showingTooltips}
      content={`${
        adding
          ? cursor.hidden
            ? "Add Rest"
            : "Set Rest"
          : inserting
          ? cursor.hidden
            ? "Append Rest"
            : "Insert Rest"
          : "Add Rest"
      }`}
    >
      <Editor.MenuButton
        className="w-5 active:bg-slate-500 active:ring-2 active:ring-slate-500"
        onClick={props.onRestClick}
        disabled={!props.isCustom || (!adding && !inserting)}
        disabledClass="w-5"
      >
        <img className="h-5 object-contain invert" src={restNote} />
      </Editor.MenuButton>
    </Editor.Tooltip>
  );
  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <AddButton />
        <CursorButton />
        <InsertButton />
        <EraseButton />
        <ClearButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true} className="space-x-2 pr-2">
        <StraightButton />
        <DottedButton />
        <TripletButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false} className="space-x-2">
        <RestButton />
        <Editor.SixtyFourthButton
          active={props.noteDuration === "64th"}
          onClick={() => props.onDurationClick("64th")}
          showTooltip={props.showingTooltips}
        />
        <Editor.ThirtySecondButton
          active={props.noteDuration === "32nd"}
          onClick={() => props.onDurationClick("32nd")}
          showTooltip={props.showingTooltips}
        />
        <Editor.SixteenthButton
          active={props.noteDuration === "16th"}
          onClick={() => props.onDurationClick("16th")}
          showTooltip={props.showingTooltips}
        />
        <Editor.EighthButton
          active={props.noteDuration === "eighth"}
          onClick={() => props.onDurationClick("eighth")}
          showTooltip={props.showingTooltips}
        />
        <Editor.QuarterButton
          active={props.noteDuration === "quarter"}
          onClick={() => props.onDurationClick("quarter")}
          showTooltip={props.showingTooltips}
        />
        <Editor.HalfButton
          active={props.noteDuration === "half"}
          onClick={() => props.onDurationClick("half")}
          showTooltip={props.showingTooltips}
        />
        <Editor.WholeButton
          active={props.noteDuration === "whole"}
          onClick={() => props.onDurationClick("whole")}
          showTooltip={props.showingTooltips}
        />
      </Editor.MenuGroup>
    </div>
  );
}
