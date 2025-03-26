import classNames from "classnames";
import { GiCompactDisc } from "react-icons/gi";
import { selectUniqueScaleNames } from "types/Track/TrackSelectors";
import { selectLastArrangementSecond } from "types/Arrangement/ArrangementSelectors";
import { selectUniqueInstrumentNames } from "types/Instrument/InstrumentSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { Project } from "types/Project/ProjectTypes";
import { selectTransport } from "types/Transport/TransportSelectors";

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

  // Get the duration of the project
  const duration = selectLastArrangementSecond(project);
  const durationText = `${duration.toFixed(1)}s`;

  // Get scale names from the project
  const scales = selectUniqueScaleNames(project);
  const hasScales = scales.length > 0;
  const scaleText = hasScales ? scales : "None";

  // Get instrument names from the project
  const samplers = selectUniqueInstrumentNames(project);
  const hasSamplers = samplers.length > 0;
  const samplerText = hasSamplers ? samplers : "None";
  return (
    <div
      className="flex bg-slate-900/50 text-slate-50 p-3 border-2 rounded border-indigo-300/50 cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-full select-none text-sm font-thin">
        <h1 className="text-2xl text-indigo-50 font-bold truncate max-w-64">
          {name}
        </h1>
        <>
          <div>
            <span className="text-indigo-300">Duration:</span> {durationText} @{" "}
            {bpm}
            BPM
          </div>
          <div className="flex gap-1">
            <span className="text-sky-300 inline-flex">Scales:</span>{" "}
            <span className="inline-flex overflow-scroll max-w-[12rem] whitespace-nowrap">
              {scaleText}
            </span>
          </div>
          <div className="flex gap-1">
            <span className="text-emerald-300 inline-flex">Samplers:</span>{" "}
            <span className="inline-flex overflow-scroll max-w-[12rem] whitespace-nowrap">
              {samplerText}
            </span>
          </div>
        </>
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
