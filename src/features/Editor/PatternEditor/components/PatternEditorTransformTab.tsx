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
        className="border"
        onClick={promptUser(
          "Repeat this pattern N times:",
          (n) => id && dispatch(_.repeatPattern({ id, repeat: n }))
        )}
        weakClass="border-emerald-600 active:bg-emerald-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Repeat
      </Editor.Button>
    </Tooltip>
  );

  const ContinueButton = () => (
    <Tooltip placement="bottom" content="Continue Pattern">
      <Editor.Button
        className="border"
        onClick={promptUser(
          "Continue this pattern for N notes:",
          (n) => id && dispatch(_.continuePattern({ id, length: n }))
        )}
        weakClass="active:bg-emerald-600 border-emerald-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Continue
      </Editor.Button>
    </Tooltip>
  );

  const PhaseButton = () => (
    <Tooltip placement="bottom" content="Phase Pattern">
      <Editor.Button
        className="border"
        onClick={promptUser(
          "Phase this pattern by N notes:",
          (n) => id && dispatch(_.phasePattern({ id, phase: n }))
        )}
        weakClass="active:bg-emerald-600 border-emerald-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Phase
      </Editor.Button>
    </Tooltip>
  );

  const DiminishButton = () => (
    <Tooltip placement="bottom" content="Diminish Pattern">
      <Editor.Button
        className="border"
        onClick={() => id && dispatch(_.stretchPattern({ id, factor: 0.5 }))}
        weakClass="active:bg-sky-600 border-sky-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Diminish
      </Editor.Button>
    </Tooltip>
  );

  const AugmentButton = () => (
    <Tooltip placement="bottom" content="Augment Pattern">
      <Editor.Button
        className="border"
        onClick={() => id && dispatch(_.stretchPattern({ id, factor: 2 }))}
        weakClass="active:bg-sky-600 border-sky-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Augment
      </Editor.Button>
    </Tooltip>
  );

  const ReverseButton = () => (
    <Tooltip placement="bottom" content="Reverse Pattern">
      <Editor.Button
        className="border"
        onClick={() => id && dispatch(_.reversePattern(id))}
        weakClass="active:bg-sky-600 border-sky-600"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Reverse
      </Editor.Button>
    </Tooltip>
  );

  const ShuffleButton = () => (
    <Tooltip placement="bottom" content="Shuffle Pattern">
      <Editor.Button
        className="border"
        onClick={() => id && dispatch(_.shufflePattern(id))}
        weakClass="active:bg-purple-500 border-purple-500"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Shuffle
      </Editor.Button>
    </Tooltip>
  );

  const ArpeggiateButton = () => (
    <Tooltip placement="bottom" content="Arpeggiate Pattern">
      <Editor.Button
        className="border"
        onClick={() => id && dispatch(_.arpeggiatePattern(id))}
        weakClass="active:bg-purple-500 border-purple-500"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Arpeggiate
      </Editor.Button>
    </Tooltip>
  );

  const HarmonizeButton = () => (
    <Tooltip placement="bottom" content="Harmonize Pattern">
      <Editor.Button
        className="border"
        onClick={promptUser(
          "Harmonize this pattern with an interval of N semitones:",
          (n) => id && dispatch(_.harmonizePattern({ id, interval: n }))
        )}
        weakClass="active:bg-purple-500 border-purple-500"
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="border-slate-500"
      >
        Harmonize
      </Editor.Button>
    </Tooltip>
  );

  const RandomizeButton = () => (
    <Tooltip placement="bottom" content="Randomize Pattern">
      <Editor.Button
        className="border"
        onClick={promptUser(
          "Randomize this pattern for N notes:",
          (n: number) => id && dispatch(_.randomizePattern(id, n))
        )}
        weakClass="active:bg-purple-500 border-purple-500"
        disabled={!props.isCustom}
        disabledClass="border-slate-500"
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
        <ArpeggiateButton />
        <HarmonizeButton />
        <RandomizeButton />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
