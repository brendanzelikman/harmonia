import { InstrumentListbox } from "features/Editor/components/EditorListbox";
import { PatternEditorProps } from "../PatternEditor";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import { useProjectDispatch } from "types/hooks";
import { EditorTooltipButton } from "components/TooltipButton";
import { FaPlayCircle } from "react-icons/fa";
import { updatePattern } from "types/Pattern/PatternSlice";
import { playPattern } from "types/Pattern/PatternThunks";

export const PatternEditorInstrumentBox = (props: PatternEditorProps) => {
  const dispatch = useProjectDispatch();
  const { pattern } = props;

  return (
    <>
      <EditorTooltipButton
        label="Play The Pattern"
        className="text-xl rounded-full active:bg-emerald-600"
        onClick={() => dispatch(playPattern(pattern))}
        keepTooltipOnClick
      >
        <FaPlayCircle />
      </EditorTooltipButton>
      <div className="h-5 ml-1 my-2 flex text-xs items-center space-x-2">
        <InstrumentListbox
          value={pattern?.instrumentKey ?? DEFAULT_INSTRUMENT_KEY}
          setValue={(value) => {
            if (!pattern) return;
            dispatch(
              updatePattern({ data: { ...pattern, instrumentKey: value } })
            );
            props.setInstrument(value);
          }}
        />
      </div>
    </>
  );
};
