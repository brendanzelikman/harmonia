import { Editor } from "features/Editor/components";
import { PatternEditorProps } from "../PatternEditor";
import * as _ from "redux/Pattern";
import { promptUser } from "utils/html";

export function PatternEditorTransformTab(props: PatternEditorProps) {
  const { dispatch, pattern, Tooltip } = props;
  const id = pattern?.id;
  const RepeatButton = () => (
    <Tooltip placement="bottom" content="Repeat Pattern">
      <Editor.Button
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={promptUser(
          "Repeat this pattern N times:",
          (n) => id && dispatch(_.repeatPattern({ id, repeat: n }))
        )}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Repeat
      </Editor.Button>
    </Tooltip>
  );

  const ContinueButton = () => (
    <Tooltip placement="bottom" content="Continue Pattern">
      <Editor.Button
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={promptUser(
          "Continue this pattern for N notes:",
          (n) => id && dispatch(_.continuePattern({ id, length: n }))
        )}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Continue
      </Editor.Button>
    </Tooltip>
  );

  const PhaseButton = () => (
    <Tooltip placement="bottom" content="Phase Pattern">
      <Editor.Button
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={promptUser(
          "Phase this pattern by N notes:",
          (n) => id && dispatch(_.phasePattern({ id, phase: n }))
        )}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Phase
      </Editor.Button>
    </Tooltip>
  );

  const DiminishButton = () => (
    <Tooltip placement="bottom" content="Diminish Pattern">
      <Editor.Button
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => id && dispatch(_.stretchPattern({ id, factor: 0.5 }))}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Diminish
      </Editor.Button>
    </Tooltip>
  );

  const AugmentButton = () => (
    <Tooltip placement="bottom" content="Augment Pattern">
      <Editor.Button
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => id && dispatch(_.stretchPattern({ id, factor: 2 }))}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Augment
      </Editor.Button>
    </Tooltip>
  );

  const ReverseButton = () => (
    <Tooltip placement="bottom" content="Reverse Pattern">
      <Editor.Button
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => id && dispatch(_.reversePattern(id))}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Reverse
      </Editor.Button>
    </Tooltip>
  );

  const ShuffleButton = () => (
    <Tooltip placement="bottom" content="Shuffle Pattern">
      <Editor.Button
        className="px-1 active:bg-purple-500 border border-purple-500"
        onClick={() => id && dispatch(_.shufflePattern(id))}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Shuffle
      </Editor.Button>
    </Tooltip>
  );

  const HarmonizeButton = () => (
    <Tooltip placement="bottom" content="Harmonize Pattern">
      <Editor.Button
        className="px-1 active:bg-purple-500 border border-purple-500"
        onClick={promptUser(
          "Harmonize this pattern with an interval of N semitones:",
          (n) => id && dispatch(_.harmonizePattern({ id, interval: n }))
        )}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Harmonize
      </Editor.Button>
    </Tooltip>
  );

  const RandomizeButton = () => (
    <Tooltip placement="bottom" content="Randomize Pattern">
      <Editor.Button
        className="px-1 active:bg-purple-500 border border-purple-500"
        onClick={promptUser(
          "Randomize this pattern for N notes:",
          (n: number) => id && dispatch(_.randomizePattern({ id, length: n }))
        )}
        disabled={!props.isCustom}
        disabledClass="px-1 border border-slate-500"
      >
        Randomize
      </Editor.Button>
    </Tooltip>
  );

  return (
    <Editor.Tab show={props.isCustom} border={false}>
      <Editor.TabGroup border={true}>
        <RepeatButton />
        <ContinueButton />
        <PhaseButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <DiminishButton />
        <AugmentButton />
        <ReverseButton />
      </Editor.TabGroup>

      <Editor.TabGroup border={false}>
        <ShuffleButton />
        <HarmonizeButton />
        <RandomizeButton />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
