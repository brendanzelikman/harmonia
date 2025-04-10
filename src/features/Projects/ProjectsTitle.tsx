import classNames from "classnames";
import { GiCompactDisc } from "react-icons/gi";
import {
  selectLastArrangementSecond,
  selectLastArrangementTick,
} from "types/Arrangement/ArrangementSelectors";
import { Project } from "types/Project/ProjectTypes";
import { selectTransport } from "types/Transport/TransportSelectors";
import { HomeListSubtitle } from "features/Home/HomeList";
import {
  selectPatternClipIds,
  selectPoseClipIds,
} from "types/Clip/ClipSelectors";
import { getBarsBeatsSixteenths } from "types/Transport/TransportFunctions";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { selectTracks } from "types/Track/TrackSelectors";
import { uniq } from "lodash";

interface ProjectTitleProps {
  onClick: () => void;
  project: Project;
}

export const ProjectTitle = (props: ProjectTitleProps) => {
  const { project, onClick } = props;

  // Get general info about the project
  const transport = selectTransport(project);
  const { bpm } = transport;

  // Get stats from the project
  const lastTick = selectLastArrangementTick(project) ?? 0;
  const duration = selectLastArrangementSecond(project);
  const bbs = getBarsBeatsSixteenths(lastTick, transport);
  const durationText = `${duration.toFixed(1)}s`;
  const patterns = selectPatternClipIds(project);
  const poses = selectPoseClipIds(project);
  const tracks = selectTracks(project);
  const scaleNames = uniq(
    tracks.map((t) => selectTrackScaleNameAtTick(project, t.id, 0))
  ).filter((s) => s !== "Empty Scale");
  return (
    <div
      className="flex min-h-0 w-full mb-auto bg-slate-900/50 text-slate-50 p-3 rounded-lg border-2 border-indigo-400/50 cursor-pointer group"
      onClick={onClick}
    >
      <div className="select-none my-auto overflow-scroll text-lg font-thin">
        <HomeListSubtitle
          title="Duration:"
          titleColor="text-indigo-400"
          body={`${durationText} (${Math.ceil(bbs.bars)} bars) @ ${bpm} BPM`}
        />
        <HomeListSubtitle
          title="Scales:"
          titleColor="text-sky-400"
          body={scaleNames.length ? scaleNames.join(", ") : "None"}
        />
        <HomeListSubtitle
          title="Patterns:"
          titleColor="text-teal-400"
          body={`${patterns.length} in total`}
        />
        <HomeListSubtitle
          title="Poses:"
          titleColor="text-fuchsia-400"
          body={`${poses.length} in total`}
        />
      </div>
      {/* Collapsed project disc */}
      <div className="min-[800px]:hidden flex">
        <GiCompactDisc
          className={classNames(
            "border-2 text-indigo-200/80 group-hover:animate-spin my-auto text-7xl rounded-full border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25",
            "bg-radial from-indigo-700 to-sky-500 shadow-[0px_0px_20px_rgb(100,100,200)]"
          )}
        />
      </div>
    </div>
  );
};
