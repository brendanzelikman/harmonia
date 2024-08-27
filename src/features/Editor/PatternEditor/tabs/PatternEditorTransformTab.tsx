import { PatternEditorProps } from "../PatternEditor";
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
import { EditorListbox } from "features/Editor/components/EditorListbox";
import {
  EditorTab,
  EditorTabGroup,
} from "features/Editor/components/EditorTab";
import { useProjectDispatch } from "types/hooks";
import {
  extractChordsFromPattern,
  flattenPattern,
  interpolatePattern,
  mergePattern,
  subdividePattern,
} from "types/Pattern/thunks/PatternChordThunks";
import {
  continuePattern,
  randomizePatternDurations,
  repeatPattern,
  setPatternDurations,
  stretchPattern,
} from "types/Pattern/thunks/PatternDurationThunks";
import {
  phasePattern,
  reversePattern,
  shufflePatternStream,
} from "types/Pattern/thunks/PatternOrderThunks";
import {
  harmonizePattern,
  setPatternPitches,
  shufflePatternPitches,
  transposePattern,
} from "types/Pattern/thunks/PatternPitchThunks";
import { randomizePatternPitches } from "types/Pattern/PatternThunks";
import {
  setPatternVelocities,
  graduatePatternVelocities,
  shufflePatternVelocities,
  randomizePatternVelocities,
} from "types/Pattern/thunks/PatternVelocityThunks";

export function PatternEditorTransformTab(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const { pattern } = props;
  const id = pattern?.id;
  if (!id) return null;

  const OrderOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Order" };
    const options = [
      defaultOption,
      {
        id: "phase pattern",
        onClick: promptUserForNumber(
          "Phase Your Pattern",
          "How many notes would you like to phase your pattern by?",
          (n) => id && dispatch(phasePattern({ data: { id, phase: n } }))
        ),
      },
      {
        id: "reverse pattern",
        onClick: () => id && dispatch(reversePattern({ data: { id } })),
      },
      {
        id: "shuffle pattern",
        onClick: () => id && dispatch(shufflePatternStream({ data: { id } })),
      },
    ];
    return (
      <EditorListbox
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
        id: "extract chords",
        onClick: promptUserForString(
          "Extract Chords for Pattern",
          "Please input comma-separated indices.",
          (string) => {
            const indices = string.split(",").map((_) => parseInt(_));
            if (indices.some((_) => isNaN(_))) return;
            dispatch(extractChordsFromPattern({ data: { id, indices } }));
          }
        ),
      },
      {
        id: "subdivide notes",
        onClick: () => id && dispatch(subdividePattern({ data: id })),
      },
      {
        id: "merge notes",
        onClick: () => id && dispatch(mergePattern({ data: id })),
      },
      {
        id: "flatten chords",
        onClick: () => id && dispatch(flattenPattern({ data: id })),
      },
      {
        id: "interpolate notes",
        onClick: promptUserForNumber(
          "Interpolate Your Pattern",
          "How many notes would you like to add between each block?",
          (n) =>
            id && dispatch(interpolatePattern({ data: { id, fillCount: n } }))
        ),
      },
    ];
    return (
      <EditorListbox
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
              setPatternDurations({
                data: { id, duration: getDurationTicks(n as DurationType) },
              })
            )
        ),
      },
      {
        id: "repeat pattern",
        onClick: promptUserForNumber(
          "Repeat Your Pattern",
          "How many times would you like to repeat your pattern?",
          (n) => id && dispatch(repeatPattern({ data: { id, repeat: n } }))
        ),
      },
      {
        id: "continue pattern",
        onClick: promptUserForNumber(
          "Continue Your Pattern",
          "How many notes would you like to repeat your pattern for?",
          (n) => id && dispatch(continuePattern({ data: { id, length: n } }))
        ),
      },
      {
        id: "compress pattern",
        onClick: () =>
          id && dispatch(stretchPattern({ data: { id, factor: 0.5 } })),
      },
      {
        id: "stretch pattern",
        onClick: () =>
          id && dispatch(stretchPattern({ data: { id, factor: 2 } })),
      },
    ];
    return (
      <EditorListbox
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
          (n) => id && dispatch(setPatternPitches({ data: { id, pitch: n } }))
        ),
      },
      {
        id: "transpose pitches",
        onClick: promptUserForNumber(
          "Transpose Your Pattern",
          "How many notes would you like to transpose your pattern by?",
          (n) =>
            id && dispatch(transposePattern({ data: { id, transpose: n } }))
        ),
      },
      {
        id: "harmonize pitches",
        onClick: promptUserForNumber(
          "Harmonize Your Pattern",
          "What interval would you like to harmonize your pattern by?",
          (n) => id && dispatch(harmonizePattern({ data: { id, interval: n } }))
        ),
      },
      {
        id: "shuffle pitches",
        onClick: () => id && dispatch(shufflePatternPitches({ data: { id } })),
      },
    ];
    return (
      <EditorListbox
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
          (n) =>
            id && dispatch(setPatternVelocities({ data: { id, velocity: n } }))
        ),
      },
      {
        id: "graduate velocities",
        onClick: promptUserForString(
          "Graduate A Range of Notes",
          `Please enter the start index, end index, start velocity, and end velocity, separated by commas (e.g. 0,4,50,100).`,
          (string) => {
            if (!id) return;

            const values = string.split(",").map((_) => parseInt(_));
            if (values.length !== 4) return;
            if (values.some((_) => isNaN(_))) return;
            const [startIndex, endIndex, startVelocity, endVelocity] = values;
            dispatch(
              graduatePatternVelocities({
                data: {
                  id,
                  startIndex,
                  endIndex,
                  startVelocity,
                  endVelocity,
                },
              })
            );
          }
        ),
      },
      {
        id: "shuffle velocities",
        onClick: () =>
          id && dispatch(shufflePatternVelocities({ data: { id } })),
      },
    ];
    return (
      <EditorListbox
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
        onClick: () => id && dispatch(randomizePatternPitches(id)),
      },
      {
        id: "randomize velocities",
        onClick: () => id && dispatch(randomizePatternVelocities(id)),
      },
      {
        id: "randomize durations",
        onClick: () => id && dispatch(randomizePatternDurations({ data: id })),
      },
    ];
    return (
      <EditorListbox
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
    <EditorTab show={props.isCustom} border={false}>
      <EditorTabGroup border={true}>
        <OrderOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <ChordOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <DurationOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <PitchOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <VelocityOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={false}>
        <RandomizeOpsDropdownButton />
      </EditorTabGroup>
    </EditorTab>
  );
}
