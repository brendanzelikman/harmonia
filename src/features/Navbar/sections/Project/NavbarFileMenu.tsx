import { blurOnEnter } from "utils/html";
import { BiTrash } from "react-icons/bi";
import { SiAudiomack, SiMidi } from "react-icons/si";
import { Menu } from "@headlessui/react";
import { ComponentProps } from "react";
import { useTransportTick } from "hooks/useTransportTick";
import { format, percent } from "utils/math";
import { useAuth } from "providers/auth";
import {
  GiLoad,
  GiNewBorn,
  GiSave,
  GiTransfuse,
  GiWoodenSign,
} from "react-icons/gi";
import classNames from "classnames";
import { use, useProjectDispatch } from "types/hooks";
import { setProjectName } from "types/Meta/MetaSlice";
import { selectMeta } from "types/Meta/MetaSelectors";
import { selectLastArrangementTick } from "types/Arrangement/ArrangementSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { createProject, clearProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { exportProjectToMIDI } from "types/Project/ProjectExporters";
import {
  stopDownloadingTransport,
  downloadTransport,
} from "types/Transport/TransportThunks";
import {
  NavbarFormInput,
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";

export function NavbarFileMenu() {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const meta = use(selectMeta);
  const { downloading } = use(selectTransport);
  const endTick = use(selectLastArrangementTick);
  const offlineTick = useTransportTick({ offline: true });
  const downloadProgress = downloading ? percent(offlineTick, 0, endTick) : 0;
  const downloadPercent = format(downloadProgress, 0);
  const hasDownloaded = downloadProgress >= 100;

  return (
    <div className="group/tooltip relative shrink-0">
      {/* Button */}
      <div className="rounded-full p-1.5">
        <GiWoodenSign className="size-full select-none cursor-pointer group-hover/tooltip:text-indigo-300" />
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip bgColor="bg-slate-900/90 backdrop-blur">
        <div className="size-full py-1 space-y-1.5 min-w-48">
          {/* Project Name */}
          <div>
            <NavbarFormInput
              id="projectName"
              className="w-full focus:bg-indigo-900/50 py-2 mb-2"
              type="text"
              placeholder="New Project"
              value={meta.name}
              onChange={(e) => dispatch(setProjectName(e.target.value))}
              onKeyDown={blurOnEnter}
            />
            <label
              htmlFor="projectName"
              className={`absolute text-xs text-indigo-400 duration-300 transform scale-75 top-1.5 z-10 origin-0 bg-slate-900 rounded px-1 left-4`}
            >
              Project Name
            </label>
          </div>

          {/* Open New Project */}
          {isAtLeastRank("maestro") && (
            <NavbarFileGroup onClick={() => createProject()}>
              <NavbarFileLabel>Open New Project</NavbarFileLabel>
              <GiNewBorn className="ml-auto text-2xl" />
            </NavbarFileGroup>
          )}

          {/* Load Project */}
          <NavbarFileGroup onClick={() => dispatch(readLocalProjects())}>
            <NavbarFileLabel>Load from File</NavbarFileLabel>
            <GiSave className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Merge Project */}
          <NavbarFileGroup
            onClick={() => dispatch(readLocalProjects({ merging: true }))}
          >
            <NavbarFileLabel>Merge with File</NavbarFileLabel>
            <GiTransfuse className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Save Project */}
          <NavbarFileGroup onClick={() => dispatch(exportProjectToHAM())}>
            <NavbarFileLabel>Save to File</NavbarFileLabel>
            <GiLoad className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Export to WAV */}
          <NavbarFormGroup
            className={`h-8 space-x-4 ${
              !endTick
                ? "text-slate-500"
                : "hover:bg-indigo-500/25 cursor-pointer"
            }`}
            onClick={() =>
              !endTick
                ? null
                : downloading
                ? dispatch(stopDownloadingTransport())
                : dispatch(downloadTransport())
            }
          >
            <NavbarFileLabel>Export to WAV</NavbarFileLabel>
            <div className="relative flex flex-col text-2xl">
              <SiAudiomack className="text-2xl" />
              {downloading && (
                <div
                  className={`text-xs w-32 animate-in fade-in zoom-in-95 absolute flex flex-col top-0 -right-36 p-2 border rounded bg-slate-800 ${
                    hasDownloaded ? "border-slate-400" : "border-slate-500"
                  }`}
                >
                  <div
                    className="h-1 self-start mb-1 w-full rounded bg-emerald-400 transition-all duration-300"
                    style={{ width: `${downloadPercent}%` }}
                  />
                  <span
                    className={
                      hasDownloaded ? "text-emerald-400" : "text-white/50"
                    }
                  >
                    {hasDownloaded ? "Exporting..." : "Rendering..."}{" "}
                    {downloadPercent}%
                  </span>
                  <button
                    className="self-start mt-2 text-center border border-slate-500 bg-slate-800 p-1 px-2 rounded"
                    onClick={() => dispatch(stopDownloadingTransport())}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </NavbarFormGroup>

          {/* Export to MIDI */}
          {isAtLeastRank("maestro") && (
            <NavbarFormGroup
              className={classNames(
                `h-8 space-x-4`,
                { "text-slate-500": !endTick },
                { "hover:bg-indigo-500/25 cursor-pointer": !!endTick }
              )}
              onClick={() => dispatch(exportProjectToMIDI())}
            >
              <NavbarFileLabel>Export to MIDI</NavbarFileLabel>
              <SiMidi className="text-2xl" />
            </NavbarFormGroup>
          )}

          {/* Clear Project */}
          <NavbarFormGroup className="h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer">
            <Menu as="div" className="w-full relative">
              {({ open, close }) => (
                <>
                  <Menu.Button className="w-full inline-flex justify-between items-center">
                    <NavbarFormLabel>Clear Project</NavbarFormLabel>
                    <BiTrash className="text-2xl" />
                  </Menu.Button>
                  {open && (
                    <Menu.Items className="animate-in fade-in zoom-in-95 absolute flex flex-col items-center -top-8 -right-52 -mr-5 p-2 bg-slate-800 border border-slate-400 text-xs rounded">
                      <div className="w-full text-center pb-1 mb-1 font-bold border-b border-b-slate-500/50">
                        Clear Project?
                      </div>
                      <span className="text-xs px-1 mb-2 text-slate-400">
                        You will lose all unsaved changes.
                      </span>
                      <div className="flex w-full total-center gap-2 *:w-1/2 *:px-2 *:py-1 *:rounded *:border">
                        <button
                          className="border-red-500 hover:text-red-500"
                          onClick={() => dispatch(clearProject())}
                        >
                          Yes
                        </button>
                        <button
                          className="border-slate-500 hover:text-slate-500"
                          onClick={close}
                        >
                          No
                        </button>
                      </div>
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          </NavbarFormGroup>
        </div>
      </NavbarHoverTooltip>
    </div>
  );
}

function NavbarFileGroup(props: ComponentProps<typeof NavbarFormGroup>) {
  return (
    <NavbarFormGroup
      className="px-2 h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer"
      {...props}
    />
  );
}

function NavbarFileLabel({ children }: { children: React.ReactNode }) {
  return (
    <NavbarFormLabel className="w-24 hover:opacity-95 active:opacity-100 whitespace-nowrap">
      {children}
    </NavbarFormLabel>
  );
}
