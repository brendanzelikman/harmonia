import { PatternEditorProps } from "../PatternEditor";
import { promptUserForNumber, promptUserForString } from "utils/html";
import {
  GiChart,
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
  beatifyPattern,
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
import {
  randomizePattern,
  randomizePatternPitches,
} from "types/Pattern/PatternThunks";
import {
  setPatternVelocities,
  graduatePatternVelocities,
  shufflePatternVelocities,
  randomizePatternVelocities,
} from "types/Pattern/thunks/PatternVelocityThunks";
import { PatternId } from "types/Pattern/PatternTypes";

export function PatternEditorTransformTab(props: PatternEditorProps) {
  const { pattern } = props;
  const id = pattern?.id;
  if (!id) return null;

  const ChordOpsDropdownButton = () => {
    const defaultOption = { id: "select", name: "Chord" };
    const options = [defaultOption, ...streamTransformations(id)];
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
    const options = [defaultOption, ...durationTransformations(id)];
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
    const options = [defaultOption, ...pitchTransformations(id)];
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
    const options = [defaultOption, ...velocityTransformations(id)];
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

  return (
    <EditorTab show={props.isCustom} border={false}>
      <EditorTabGroup border={true}>
        <ChordOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <DurationOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup border={true}>
        <PitchOpsDropdownButton />
      </EditorTabGroup>
      <EditorTabGroup>
        <VelocityOpsDropdownButton />
      </EditorTabGroup>
    </EditorTab>
  );
}

export type Transformation = {
  id: string;
  label: string;
  onClick: () => void;
};

export const streamTransformations = (id: PatternId): Transformation[] => {
  const dispatch = useProjectDispatch();
  return [
    {
      id: "repeat pattern",
      label: "Repeat",
      onClick: promptUserForNumber(
        "Repeat Your Pattern",
        "How many times would you like to repeat your pattern?",
        (n) => id && dispatch(repeatPattern({ data: { id, repeat: n } }))
      ),
    },
    {
      id: "extend pattern",
      label: "Extend",
      onClick: promptUserForNumber(
        "Extend Your Pattern",
        "How many notes would you like to extend your stream to?",
        (n) => id && dispatch(continuePattern({ data: { id, length: n } }))
      ),
    },
    {
      id: "extract chords",
      label: "Split",
      onClick: promptUserForString(
        "Extract Chords at Indices",
        "Which indices would you like to migrate? (e.g. 0, 2)",
        (string) => {
          const indices = string.split(",").map((_) => parseInt(_));
          dispatch(extractChordsFromPattern({ data: { id, indices } }));
        }
      ),
    },
    {
      id: "phase pattern",
      label: "Phase",
      onClick: promptUserForNumber(
        "Phase Your Pattern",
        "How many notes would you like to phase your pattern by?",
        (n) => id && dispatch(phasePattern({ data: { id, phase: n } }))
      ),
    },
    {
      id: "reverse pattern",
      label: "Reverse",
      onClick: () => id && dispatch(reversePattern({ data: { id } })),
    },
    {
      id: "shuffle pattern",
      label: "Shuffle",
      onClick: () => id && dispatch(shufflePatternStream({ data: { id } })),
    },
    {
      id: "randomize pattern",
      label: "Randomize",
      onClick: () => id && dispatch(randomizePattern(id)),
    },
  ];
};

export const durationTransformations = (id: PatternId): Transformation[] => {
  const dispatch = useProjectDispatch();
  return [
    {
      id: "compress pattern",
      label: "Diminish",
      onClick: () =>
        id && dispatch(stretchPattern({ data: { id, factor: 0.5 } })),
    },
    {
      id: "stretch pattern",
      label: "Augment",
      onClick: () =>
        id && dispatch(stretchPattern({ data: { id, factor: 2 } })),
    },
    {
      id: "subdivide notes",
      label: "Subdivide",
      onClick: () => id && dispatch(subdividePattern({ data: id })),
    },
    {
      id: "merge notes",
      label: "Chordify",
      onClick: () => id && dispatch(mergePattern({ data: id })),
    },
    {
      id: "flatten chords",
      label: "Arpeggiate",
      onClick: () => id && dispatch(flattenPattern({ data: id })),
    },
    {
      id: "beatify pattern",
      label: "Beatify",
      onClick: () => id && dispatch(beatifyPattern({ data: id })),
    },
    {
      id: "set durations",
      label: "Overwrite",
      onClick: promptUserForString(
        "Set Each Note's Duration",
        `What duration would you like to set each note? (e.g. "quarter")`,
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
      id: "randomize durations",
      label: "Randomize",
      onClick: () => id && dispatch(randomizePatternDurations({ data: id })),
    },
  ];
};

export const pitchTransformations = (id: PatternId): Transformation[] => {
  const dispatch = useProjectDispatch();
  return [
    {
      id: "transpose pitches",
      label: "Transpose",
      onClick: promptUserForNumber(
        "Transpose Your Pattern",
        "How many steps would you like to transpose your pattern by?",
        (n) => id && dispatch(transposePattern({ data: { id, transpose: n } }))
      ),
    },
    {
      id: "harmonize pitches",
      label: "Harmonize",
      onClick: promptUserForNumber(
        "Harmonize Your Pattern",
        "What interval would you like to harmonize your pattern by?",
        (n) => id && dispatch(harmonizePattern({ data: { id, interval: n } }))
      ),
    },
    {
      id: "interpolate notes",
      label: "Interpolate",
      onClick: promptUserForNumber(
        "Interpolate Your Pattern",
        "How many notes would you like to add between each block?",
        (n) =>
          id && dispatch(interpolatePattern({ data: { id, fillCount: n } }))
      ),
    },
    {
      id: "set pitches",
      label: "Overwrite",
      onClick: promptUserForString(
        "Set Each Note's Pitch",
        "What pitch would you like to set each note to?",
        (n) => id && dispatch(setPatternPitches({ data: { id, pitch: n } }))
      ),
    },
    {
      id: "shuffle pitches",
      label: "Shuffle",
      onClick: () => id && dispatch(shufflePatternPitches({ data: { id } })),
    },
    {
      id: "randomize pitches",
      label: "Randomize",
      onClick: () => id && dispatch(randomizePatternPitches(id)),
    },
  ];
};

export const velocityTransformations = (id: PatternId): Transformation[] => {
  const dispatch = useProjectDispatch();
  return [
    {
      id: "graduate velocities",
      label: "Graduate",
      onClick: promptUserForString(
        "Graduate A Range of Notes",
        `Please enter the start index, end index, start velocity, and end velocity, separated by commas (e.g. 0,4,50,100).`,
        (string) => {
          if (!id) return;

          const values = string.split(",").map((_) => parseInt(_));
          const [startIndex, endIndex, startVelocity, endVelocity] = values;
          dispatch(
            graduatePatternVelocities({
              data: { id, startIndex, endIndex, startVelocity, endVelocity },
            })
          );
        }
      ),
    },
    {
      id: "set velocities",
      label: "Overwrite",
      onClick: promptUserForNumber(
        "Set Each Note's Velocity",
        `What velocity would you like to set each note to?`,
        (n) =>
          id && dispatch(setPatternVelocities({ data: { id, velocity: n } }))
      ),
    },
    {
      id: "shuffle velocities",
      label: "Shuffle",
      onClick: () => id && dispatch(shufflePatternVelocities({ data: { id } })),
    },
    {
      id: "randomize velocities",
      label: "Randomize",
      onClick: () => id && dispatch(randomizePatternVelocities(id)),
    },
  ];
};
