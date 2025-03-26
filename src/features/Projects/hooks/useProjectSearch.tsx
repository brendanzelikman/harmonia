import { lowerCase } from "lodash";
import { useMemo } from "react";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { defaultProject, isProject, Project } from "types/Project/ProjectTypes";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectInstruments } from "types/Instrument/InstrumentSelectors";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import {
  selectScaleTracks,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { getScaleName } from "utils/scale";

interface ProjectSearchProps {
  projects: Project[];
  query: string;
  filePaths?: string[];
}

export function useProjectSearch(props: ProjectSearchProps) {
  const { projects, query } = props;

  // Get the filtered projects
  const results = useMemo(
    () =>
      projects
        .filter((item) => {
          const project =
            "present" in item ? item : { ...defaultProject, present: item };
          if (!isProject(project)) return false;
          // Get the list of patterns used
          const patternMap = selectPatternMap(project);
          const patternClips = selectPatternClips(project);
          const allPatternIds = patternClips.map(({ patternId }) => patternId);
          const patternIds = [...new Set(allPatternIds)];
          const allPatternNames = patternIds.map((id) => patternMap[id]?.name);
          const patternNames = [...new Set(allPatternNames)].map(lowerCase);

          // Get the list of scales used
          const scaleTracks = selectScaleTracks(project);
          const allScales = scaleTracks.map(({ id }) =>
            selectTrackMidiScale(project, id)
          );
          const allScaleNames = allScales.map((scale) => getScaleName(scale));
          const scaleNames = [...new Set(allScaleNames)].map(lowerCase);

          // Get the list of instruments used
          const instruments = selectInstruments(project);
          const allInstrumentNames = instruments.map(({ key }) =>
            getInstrumentName(key)
          );
          const instrumentNames = [...new Set(allInstrumentNames)].map(
            lowerCase
          );

          // Get the name of the project
          const meta = selectMeta(project);
          const name = meta.name.toLowerCase();

          // Get the date of the project
          const date = new Date(meta.dateCreated)
            .toLocaleString("default", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            .toLowerCase();

          // Filter the projects by search term
          const term = query.toLowerCase().trim();
          const hasPattern = patternNames.some((_) => _.includes(term));
          const hasScale = scaleNames.some((_) => _.includes(term));
          const hasInstrument = instrumentNames.some((_) => _.includes(term));
          const hasName = name.includes(term);
          const hasDate = date.includes(term);
          return hasPattern || hasScale || hasInstrument || hasName || hasDate;
        })
        .sort((a, b) => {
          const dateA = new Date(selectMeta(a).lastUpdated);
          const dateB = new Date(selectMeta(b).lastUpdated);
          return dateB.getTime() - dateA.getTime();
        }),
    [projects, query]
  );

  return results;
}
