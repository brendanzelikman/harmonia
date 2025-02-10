import { cancelEvent, dispatchCustomEvent } from "utils/html";
import { useEffect, useRef, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import classNames from "classnames";
import { ProjectItem } from "./hooks/useProjectList";
import { useAuth } from "providers/auth";
import { isProject } from "types/Project/ProjectTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { selectLastArrangementTick } from "types/Arrangement/ArrangementSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { createProject, deleteProject } from "types/Project/ProjectThunks";
import { loadProjectByPath, loadProject } from "types/Project/ProjectLoaders";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { GiCompactDisc } from "react-icons/gi";
import moment from "moment";
import { selectScaleNameMap } from "types/Arrangement/ArrangementTrackSelectors";
import { getDictValues } from "utils/objects";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { uniq } from "lodash";
import { selectInstrumentMap } from "types/Instrument/InstrumentSelectors";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { DragSourceMonitor, useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useToggledState } from "hooks/useToggledState";
import { useCustomEventListener } from "hooks/useCustomEventListener";

interface ProjectFormatterProps extends ProjectItem {
  index?: number;
}

const RotatedDisc = () => {
  const prev = useRef({ x: 0, y: 0 });
  const { isDragging, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
    })
  );
  useEffect(() => {
    const { x, y } = currentOffset || { x: 0, y: 0 };
    if (!initialOffset) return;
    const dx = (x - initialOffset.x) * 0.1;
    const dy = (y - initialOffset.y) * 0.1;
    prev.current = { x: dx, y: dy };
  }, [currentOffset, initialOffset]);

  if (!isDragging || !currentOffset || !initialOffset) return null;
  let { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y - 25}px) rotateX(75deg)`;
  return (
    <GiCompactDisc
      className="w-72 h-72 top-0 left-0 rotate-disc fixed select-none pointer-events-none z-50"
      style={{ transform }}
    />
  );
};

export const ProjectDraggableDisc = (props: {
  projectId: string;
  className?: string;
  onClick?: () => void;
}) => {
  const state = useToggledState(props.projectId, false);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "project",
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: { id: props.projectId },
    }),
    []
  );
  useEffect(() => {
    if (state.isOpen && !isDragging) {
      state.close();
      dispatchCustomEvent("dragged-project", false);
    } else if (!state.isOpen && isDragging) {
      state.open();
      dispatchCustomEvent("dragged-project", props.projectId);
    }
  }, [state, isDragging]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <div
      onClick={props.onClick}
      className={classNames(isDragging ? "opacity-0" : "opacity-100")}
      ref={drag}
    >
      <GiCompactDisc
        className={classNames(props.className, "size-full rounded-full")}
      />
    </div>
  );
};

export function ProjectFormatter(props: ProjectFormatterProps) {
  const { canPlay } = useAuth();
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();
  const { project } = props;
  const holding = useHeldHotkeys(["alt"]);
  const isInvalid = !isProject(project);
  const isDemo = !!props.filePath;

  const [deleting, setDeleting] = useState(false);
  const toggleDeleting = () => setDeleting((prev) => !prev);
  useHotkeys("esc", () => setDeleting(false));

  // Get general info about the project
  const meta = selectMeta(project);
  const { id, name } = meta;
  const dateCreated = moment(meta.dateCreated).calendar();
  const lastUpdated = moment(meta.lastUpdated).fromNow();
  const transport = selectTransport(project);
  const { bpm } = transport;

  // Get the duration of the project
  const lastTick = selectLastArrangementTick(project);
  const duration = convertTicksToSeconds(transport, lastTick);
  const seconds = `${duration.toFixed(1)}s`;

  // Get scale names from the project
  const scaleNameMap = selectScaleNameMap(project);
  const _scales = uniq(
    getDictValues(scaleNameMap).map((n) => n.split(") ")[1])
  ).join(", ");
  const scales = _scales.length > 0 ? _scales : "None";

  // Get actively used pattern names from the project
  const patternMap = selectPatternMap(project);
  const patternClips = selectPatternClips(project);
  const _patterns = uniq(
    patternClips.map((c) => patternMap[c.patternId]?.name).filter(Boolean)
  ).join(", ");
  const patterns = _patterns.length > 0 ? _patterns : "None";

  // Get instrument names from the project
  const instrumentMap = selectInstrumentMap(project);
  const _instruments = uniq(
    getDictValues(instrumentMap).map((i) => getInstrumentName(i.key))
  ).join(", ");
  const instruments = _instruments.length > 0 ? _instruments : "None";

  /** Display the title and general info */
  const ProjectTitle = () => (
    <div className="w-full select-none text-sm font-thin bg-slate-900/50 border-2 border-indigo-300/50 text-slate-50 p-3 rounded">
      <h1 className="text-2xl text-indigo-50 font-bold truncate max-w-64">
        {name}
      </h1>
      {/* Disabled for now */}
      {holding.alt && false ? (
        <div className="*:whitespace-nowrap max-w-64 overflow-scroll">
          <h6>
            <span className="text-sky-300">Scales:</span> {scales}
          </h6>
          <h6>
            <span className="text-emerald-300">Patterns:</span> {patterns}
          </h6>
          <h6>
            <span className="text-orange-300">Instruments:</span> {instruments}
          </h6>
        </div>
      ) : (
        <>
          <h6>
            <span className="text-indigo-300">Duration:</span> {seconds} @ {bpm}
            BPM
          </h6>
          <h6 className="flex gap-1">
            <span className="text-sky-300 inline-flex">Scales:</span>{" "}
            <span className="inline-flex overflow-scroll max-w-[12rem] whitespace-nowrap">
              {scales}
            </span>
          </h6>
          <h6 className="flex gap-1">
            <span className="text-emerald-300 inline-flex">Instruments:</span>{" "}
            <span className="inline-flex overflow-scroll max-w-[12rem] whitespace-nowrap">
              {instruments}
            </span>
          </h6>
        </>
      )}
    </div>
  );

  const ProjectDisc = () => (
    // <div className="p-4">
    <ProjectDraggableDisc
      projectId={props.project.present.meta.id}
      onClick={onClick}
      className={classNames(
        "w-full p-2 h-fit rounded-full",
        "border-2 border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25",
        "bg-gradient-radial shadow-[0px_0px_20px_rgb(100,100,200)]",
        deleting ? "from-red-500 to-red-700" : "from-indigo-700 to-sky-500",
        "cursor-pointer transition-all duration-500 active:text-indigo-200 hover:duration-150"
      )}
    />
    // </div>
  );

  const ProjectMenu = () => (
    <div className="peer select-none gap-2 p-2 flex order-2 justify-evenly text-md font-bold bg-slate-900/80 ease-in-out transition-all duration-500 px-5 mx-auto border-2 rounded border-indigo-400 cursor-pointer">
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={onClick}
      >
        Play
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={() => createProject(project)}
      >
        Copy
      </button>
      <button
        className="px-3 py-1 rounded border border-slate-500 hover:bg-slate-950"
        onClick={() => dispatch(exportProjectToHAM(project))}
      >
        Save
      </button>
      <div
        className="px-3 py-1 z-50 rounded relative border border-slate-500 hover:bg-slate-950"
        onClick={toggleDeleting}
      >
        Delete
        {deleting && (
          <div className="absolute p-1 w-32 bg-slate-950 shadow-xl left-16 top-4 rounded border-2 border-slate-600/80 text-xs text-slate-200 whitespace-nowrap">
            <p className="pb-1 mb-1 text-center border-b border-b-slate-500 w-full">
              Are you sure?
            </p>
            <div className="flex w-full items-center justify-center">
              <button
                className="px-4 hover:bg-slate-700 hover:text-red-500 rounded"
                onClick={(e) => {
                  cancelEvent(e);
                  dispatch(deleteProject(id));
                }}
              >
                Yes
              </button>
              <button className="px-4 hover:bg-slate-700 hover:text-sky-200 rounded">
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Load the project by path or database if necessary
  const onClick = () => {
    const callback = () => !isInvalid && canPlay && navigate("/playground");
    if (isInvalid || !canPlay) return;
    if (props.filePath) {
      dispatch(loadProjectByPath(props.filePath, callback));
    } else {
      dispatch(loadProject(id, callback));
    }
  };

  return (
    <div
      key={id}
      className={classNames(
        "flex flex-col gap-4 p-4 bg-sky-500/10 rounded-lg",
        "text-slate-200 border-2 border-indigo-300/50 text-sm snap-center",
        "animate-in fade-in duration-500 ease-out",
        { "ring ring-red-500 cursor-not-allowed": isInvalid }
      )}
    >
      <ProjectMenu />
      <div
        className={classNames(
          "size-full w-full mx-auto order-1",
          isDemo ? "text-slate-400" : "text-indigo-200/70"
        )}
      >
        <div className="flex flex-col gap-4 ">
          <ProjectTitle />
          {ProjectDisc()}
          {RotatedDisc()}
        </div>
      </div>
    </div>
  );
}
