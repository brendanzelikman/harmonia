import { getProject } from "app/projects";
import { store } from "app/store";
import { useAppValue } from "hooks/useRedux";
import { useEffect } from "react";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectPatterns } from "types/Pattern/PatternSelectors";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { convertProjectToNotes } from "types/Timeline/TimelineThunks";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";

export const usePlaygroundProjectPatterns = () => {
  const patterns = useAppValue(selectPatterns);
  useEffect(() => {
    for (const pattern of patterns) {
      if (pattern.projectId) {
        const project = await getProject(pattern.projectId);
        if (!project) continue;
        const stream = convertProjectToNotes(project);
        const clip = selectPatternClips(payload).find(
          (clip) => clip.patternId === pattern.id
        );
        const boundStream = stream.map((b) =>
          getPatternBlockWithNewNotes(b, (n) =>
            n.map((n) => store.dispatch(autoBindNoteToTrack(clip?.trackId, n)))
          )
        );
        pattern.stream = boundStream;
      }
    }
  }, []);
};
