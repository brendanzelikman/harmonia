import { BiAnchor } from "react-icons/bi";
import {
  BsBrushFill,
  BsPencilFill,
  BsCursor,
  BsEraser,
  BsTrash,
} from "react-icons/bs";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";
import restNote from "assets/noteheads/rest.png";
import { Duration, TIMINGS, Timing } from "types/units";
import { blurOnEnter } from "appUtil";
import { MIDI } from "types/midi";
import { useEffect, useState } from "react";
import { clamp } from "lodash";

interface PatternComposeTabProps extends PatternEditorCursorProps {
  onRestClick: () => void;
  onEraseClick: () => void;
  onDurationClick: (duration: Duration) => void;
  onTimingClick: (timing: Timing) => void;
}

export function PatternComposeTab(props: PatternComposeTabProps) {
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

  const DurationButtons = () => (
    <>
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
    </>
  );

  const TimingField = () => (
    <div className="flex items-center justify-center text-xs px-1">
      <label className="pr-2">Timing:</label>
      <Editor.CustomListbox
        value={props.noteTiming}
        setValue={(timing) => props.onTimingClick(timing)}
        options={TIMINGS}
        getOptionKey={(timing) => timing}
        getOptionValue={(timing) => timing}
        getOptionName={(timing) => timing}
        className="h-8"
        borderColor="border-teal-600"
      />
    </div>
  );

  const [inputVelocity, setInputVelocity] = useState(props.noteVelocity);

  // Update velocity when enter is pressed
  const onVelocityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isNaN(inputVelocity)) return;
      blurOnEnter(e);
      const velocity = clamp(inputVelocity, MIDI.MinVelocity, MIDI.MaxVelocity);

      // If the cursor is hidden, change the general velocity
      if (props.cursor.hidden) {
        props.setNoteVelocity(velocity);
        return;
      }

      // Otherwise, change the velocity of the current chord
      if (!pattern) return;
      const chord = pattern.stream[cursor.index];
      if (!chord) return;
      const patternChord = chord.map((note) => ({ ...note, velocity }));
      props.updatePatternChord(pattern, cursor.index, patternChord);
    }
  };

  // Update input velocity and timing when cursor moves
  useEffect(() => {
    if (!pattern || cursor.hidden) return;
    const chord = pattern.stream[cursor.index];
    if (!chord) return;
    const note = chord[0];
    if (!note) return;

    // Update velocity
    const { velocity } = note;
    setInputVelocity(velocity);

    // Update timing
    if (MIDI.isTriplet(note)) props.setNoteTiming("triplet");
    else if (MIDI.isDotted(note)) props.setNoteTiming("dotted");
    else props.setNoteTiming("straight");
  }, [pattern, cursor, props.noteVelocity]);

  // Update input velocity when props velocity changes
  useEffect(() => {
    setInputVelocity(props.noteVelocity);
  }, [props.noteVelocity]);

  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <AddButton />
        <CursorButton />
        <InsertButton />
        <EraseButton />
        <ClearButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <RestButton />
        <DurationButtons />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <TimingField />
        <VelocityField
          value={inputVelocity}
          setValue={setInputVelocity}
          onKeyDown={onVelocityKeyDown}
        />
      </Editor.MenuGroup>
    </div>
  );
}

const VelocityField = (props: {
  value: number;
  setValue: (value: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center justify-center text-xs pl-2 pr-1">
    <label className="pr-2">Velocity:</label>
    <input
      className="w-12 h-7 text-center rounded bg-slate-800/50 text-slate-200 text-xs px-1 border-[1.5px] border-teal-600 focus:ring-0 focus:border-blue-600/80 focus:outline-none"
      type="number"
      value={props.value}
      onChange={(e) => props.setValue(e.target.valueAsNumber)}
      min={MIDI.MinVelocity}
      max={MIDI.MaxVelocity}
      placeholder="0-127"
      onKeyDown={props.onKeyDown}
    />
  </div>
);
