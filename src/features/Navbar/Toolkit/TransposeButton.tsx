import { BsMagic } from "react-icons/bs";
import { blurOnEnter } from "utils/html";
import { ControlButton } from ".";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarTooltipMenu,
} from "../components";
import {
  getTranspositionVectorAsString,
  TranspositionVector,
} from "types/Transposition";
import { getScaleName } from "types/Scale";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import {
  selectTimeline,
  selectSelectedTrack,
  selectDraftedPose,
  selectScaleMap,
  selectScaleTrackMap,
  selectTrackParents,
} from "redux/selectors";
import { isTimelineAddingTranspositions } from "types/Timeline";
import { toggleAddingTranspositions, updateMediaDraft } from "redux/Timeline";
import { useNumericInputs } from "hooks";
import { pick } from "lodash";

export const ToolkitTransposeButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const scaleMap = useProjectSelector(selectScaleMap);
  const scaleTrackMap = useProjectSelector(selectScaleTrackMap);
  const isAdding = isTimelineAddingTranspositions(timeline);
  const transposition = useProjectSelector(selectDraftedPose);
  const { vector, duration } = transposition;

  // Selected track info
  const track = useProjectDeepSelector(selectSelectedTrack);
  const tracks = useProjectDeepSelector((_) =>
    selectTrackParents(_, track?.id)
  );
  const trackIds = useProjectSelector((_) => tracks.map((t) => t.id));
  const offsetIds = ["chromatic", ...trackIds, "chordal"];
  const filteredVector = pick(vector, offsetIds) as TranspositionVector;

  /** Store the numeric input of each drafted offset */
  const NoteOffsets = useNumericInputs(
    offsetIds.map((id) => ({
      id,
      initialValue: vector?.[id] ?? 0,
      callback: (value) => {
        const update = { vector: { ...vector, [id]: value ?? 0 } };
        dispatch(updateMediaDraft({ pose: update }));
      },
    }))
  );

  /** Create an input element for a given offset ID. */
  const OffsetInput = (id: string) => {
    return (
      <NavbarFormInput
        value={NoteOffsets.getValue(id)}
        onChange={NoteOffsets.onChange(id)}
        placeholder="0"
        type="string"
        className="focus:bg-fuchsia-600 h-7 ml-4 w-16"
      />
    );
  };

  /** The scalar offset inputs */
  const OffsetInputs = () => {
    return offsetIds.map((id, i) => {
      let name = "";
      if (id === "chromatic") name = "Chromatic Offset";
      else if (id === "chordal") name = "Chordal Offset";
      else name = getScaleName(scaleMap[scaleTrackMap[id]?.scaleId]);
      return (
        <NavbarFormGroup key={`offset-${id}`}>
          <NavbarFormLabel className="w-32">
            <span className="text-gray-300">({i + 1})</span> {name}:{" "}
          </NavbarFormLabel>
          {OffsetInput(id)}
        </NavbarFormGroup>
      );
    });
  };

  /** The duration input */
  const Duration = useNumericInputs([
    {
      id: "duration",
      initialValue: duration,
      min: 0,
      callback: (duration) => {
        dispatch(updateMediaDraft({ pose: { duration } }));
      },
    },
  ]);
  const DurationInput = () => {
    return (
      <NavbarFormGroup>
        <NavbarFormLabel className="w-32">Duration (Ticks):</NavbarFormLabel>
        <NavbarFormInput
          value={Duration.getValue("duration")}
          onChange={Duration.onChange("duration")}
          type="number"
          placeholder={Infinity.toLocaleString()}
          className="focus:bg-fuchsia-600 h-7 ml-4 w-16"
          onKeyDown={blurOnEnter}
        />
      </NavbarFormGroup>
    );
  };

  /** The Transpose Button toggles the dropdown menu */
  const TransposeButton = () => {
    const buttonClass = `bg-transposition ring-2 ring-offset-2 ${
      isAdding
        ? "ring-transposition/80 ring-offset-black"
        : "ring-transparent ring-offset-transparent"
    }`;
    return (
      <ControlButton
        label="Transpose Clip"
        onClick={() => dispatch(toggleAddingTranspositions())}
        className={buttonClass}
      >
        <BsMagic className="-rotate-90 p-0.5" />
      </ControlButton>
    );
  };

  /** The Transpose Tooltip displays the dropdown menu. */
  const TransposeTooltip = () => {
    return (
      <NavbarTooltip
        className="-left-[6rem] bg-fuchsia-600 min-w-[15rem] px-3"
        show={!!isAdding}
        content={
          <NavbarTooltipMenu>
            <div className="pb-2 mb-2 w-full text-center font-bold border-b">
              Transposing by {getTranspositionVectorAsString(filteredVector)}
            </div>
            <div className="w-full h-full py-2 space-y-2">
              {OffsetInputs()}
              {DurationInput()}
            </div>
          </NavbarTooltipMenu>
        }
      />
    );
  };

  return (
    <div className="flex flex-col relative">
      <TransposeButton />
      {TransposeTooltip()}
    </div>
  );
};
