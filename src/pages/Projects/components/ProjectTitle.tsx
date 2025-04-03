import classNames from "classnames";
import { GiCompactDisc } from "react-icons/gi";
import { selectUniqueScaleNames } from "types/Track/TrackSelectors";
import { selectLastArrangementSecond } from "types/Arrangement/ArrangementSelectors";
import { selectUniqueInstrumentNames } from "types/Instrument/InstrumentSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { Project } from "types/Project/ProjectTypes";
import { selectTransport } from "types/Transport/TransportSelectors";
import { HomeListSubtitle, HomeListTitle } from "pages/components/HomeList";

interface ProjectTitleProps {
  onClick: () => void;
  project: Project;
}

export const ProjectTitle = (props: ProjectTitleProps) => {
  const { project, onClick } = props;

  // Get general info about the project
  const meta = selectMeta(project);
  const { name } = meta;
  const transport = selectTransport(project);
  const { bpm } = transport;

  // Get stats from the project
  const duration = selectLastArrangementSecond(project);
  const durationText = `${duration.toFixed(1)}s`;
  const scales = selectUniqueScaleNames(project);
  const samplers = selectUniqueInstrumentNames(project);
  return (
    <div
      className="flex bg-slate-900/50 text-slate-50 p-3 border-2 rounded border-indigo-300/50 cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-full select-none text-sm font-thin">
        <HomeListTitle title={name} />
        <HomeListSubtitle
          title="Duration:"
          titleColor="text-indigo-300"
          body={`${durationText} @ ${bpm} BPM`}
        />
        <HomeListSubtitle
          title="Scales:"
          titleColor="text-sky-300"
          body={scales.length ? scales : "None"}
        />
        <HomeListSubtitle
          title="Samplers:"
          titleColor="text-emerald-300"
          body={samplers.length ? samplers : "None"}
        />
      </div>
      <div className="min-[800px]:hidden flex">
        <GiCompactDisc
          className={classNames(
            "border-2 text-indigo-200/80 group-hover:animate-spin my-auto text-7xl rounded-full border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25",
            "bg-gradient-radial from-indigo-700 to-sky-500 shadow-[0px_0px_20px_rgb(100,100,200)]"
          )}
        />
      </div>
    </div>
  );
};
