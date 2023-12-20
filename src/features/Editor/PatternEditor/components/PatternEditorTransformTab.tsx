import { Editor } from "features/Editor/components";
import { PatternEditorProps } from "../PatternEditor";
import * as _ from "redux/Pattern";
import { promptUserForNumber, promptUserForString } from "utils/html";
import {
  GiChart,
  GiDiceSixFacesFive,
  GiHorizontalFlip,
  GiMusicalNotes,
  GiStack,
  GiStrikingArrows,
} from "react-icons/gi";
import { DurationType, getDurationTicks } from "utils/durations";

export function PatternEditorTransformTab(props: PatternEditorProps) {
  const { dispatch, pattern } = props;
  const id = pattern?.id;

  const OrderOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Order" };
    const options = [
      defaultOption,
      {
        id: "phase pattern",
        onClick: promptUserForNumber(
          "Phase Your Pattern",
          "How many notes would you like to phase your pattern by?",
          (n) => id && dispatch(_.phasePattern({ id, phase: n }))
        ),
      },
      {
        id: "reverse pattern",
        onClick: () => id && dispatch(_.reversePattern(id)),
      },
      {
        id: "shuffle pattern",
        onClick: () => id && dispatch(_.shufflePatternStream(id)),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiStrikingArrows />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  const ChordOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Chord" };
    const options = [
      defaultOption,
      {
        id: "subdivide notes",
        onClick: () => id && dispatch(_.subdividePattern(id)),
      },
      {
        id: "merge notes",
        onClick: () => id && dispatch(_.mergePattern(id)),
      },
      {
        id: "arpeggiate notes",
        onClick: () => id && dispatch(_.flattenPattern(id)),
      },
      {
        id: "interpolate notes",
        onClick: promptUserForNumber(
          "Interpolate Your Pattern",
          "How many notes would you like to add between each block?",
          (n) => id && dispatch(_.interpolatePattern({ id, fillCount: n }))
        ),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiStack />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  const DurationOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Duration" };
    const options = [
      defaultOption,
      {
        id: "set durations",
        onClick: promptUserForString(
          "Set Each Note's Duration",
          "What duration would you like to set each note to?",
          (n) =>
            id &&
            dispatch(
              _.setPatternDurations({
                id,
                duration: getDurationTicks(n as DurationType),
              })
            )
        ),
      },
      {
        id: "repeat pattern",
        onClick: promptUserForNumber(
          "Repeat Your Pattern",
          "How many times would you like to repeat your pattern?",
          (n) => id && dispatch(_.repeatPattern({ id, repeat: n }))
        ),
      },
      {
        id: "continue pattern",
        onClick: promptUserForNumber(
          "Continue Your Pattern",
          "How many notes would you like to repeat your pattern for?",
          (n) => id && dispatch(_.continuePattern({ id, length: n }))
        ),
      },
      {
        id: "compress pattern",
        onClick: () => id && dispatch(_.stretchPattern({ id, factor: 0.5 })),
      },
      {
        id: "stretch pattern",
        onClick: () => id && dispatch(_.stretchPattern({ id, factor: 2 })),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiHorizontalFlip />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  const PitchOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Pitch" };
    const options = [
      defaultOption,
      {
        id: "set pitches",
        onClick: promptUserForString(
          "Set Each Note's Pitch",
          "What pitch would you like to set each note to?",
          (n) => id && dispatch(_.setPatternPitches({ id, pitch: n }))
        ),
      },
      {
        id: "transpose pitches",
        onClick: promptUserForNumber(
          "Transpose Your Pattern",
          "How many notes would you like to transpose your pattern by?",
          (n) => id && dispatch(_.transposePattern({ id, transpose: n }))
        ),
      },
      {
        id: "harmonize pitches",
        onClick: promptUserForNumber(
          "Harmonize Your Pattern",
          "What interval would you like to harmonize your pattern by?",
          (n) => id && dispatch(_.harmonizePattern({ id, interval: n }))
        ),
      },
      {
        id: "shuffle pitches",
        onClick: () => id && dispatch(_.shufflePatternPitches(id)),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiMusicalNotes />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  const VelocityOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Velocity" };
    const options = [
      defaultOption,
      {
        id: "set velocities",
        onClick: promptUserForNumber(
          "Set Each Note's Velocity",
          "What velocity would you like to set each note to?",
          (n) => id && dispatch(_.setPatternVelocities({ id, velocity: n }))
        ),
      },
      {
        id: "graduate velocities",
        onClick: promptUserForString(
          "Graduate A Range of Notes",
          `Please enter the start index, end index, start velocity, and end velocity, separated by commas (e.g. 0,4,50,100).`,
          (string) => {
            if (!id) return;
            const [startIndex, endIndex, startVelocity, endVelocity] = string
              .split(",")
              .map((_) => parseInt(_));
            if (
              isNaN(startIndex) ||
              isNaN(endIndex) ||
              isNaN(startVelocity) ||
              isNaN(endVelocity)
            )
              return;
            dispatch(
              _.graduatePatternVelocities({
                id,
                startIndex,
                endIndex,
                startVelocity,
                endVelocity,
              })
            );
          }
        ),
      },
      {
        id: "shuffle velocities",
        onClick: () => id && dispatch(_.shufflePatternVelocities(id)),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiChart />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  const RandomizeOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Randomize" };
    const options = [
      defaultOption,
      {
        id: "randomize pitches",
        onClick: () => id && dispatch(_.randomizePatternPitches(id)),
      },
      {
        id: "randomize velocities",
        onClick: () => id && dispatch(_.randomizePatternVelocities(id)),
      },
      {
        id: "randomize durations",
        onClick: () => id && dispatch(_.randomizePatternDurations(id)),
      },
    ];
    return (
      <Editor.CustomListbox
        className="capitalize"
        value={defaultOption}
        icon={<GiDiceSixFacesFive />}
        options={options}
        optionClassName={(option) =>
          option.id === "select" ? "opacity-75" : ""
        }
        getOptionKey={(option) => option.id}
        getOptionName={(option) => ("name" in option ? option.name : option.id)}
        setValue={(option) => ("onClick" in option ? option.onClick() : null)}
      />
    );
  };

  return (
    <Editor.Tab show={props.isCustom} border={false}>
      <Editor.TabGroup border={true}>
        <OrderOpsDropdownButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <ChordOpsDropdownButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <DurationOpsDropdownButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <PitchOpsDropdownButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={true}>
        <VelocityOpsDropdownButton />
      </Editor.TabGroup>
      <Editor.TabGroup border={false}>
        <RandomizeOpsDropdownButton />
      </Editor.TabGroup>
    </Editor.Tab>
  );
}
