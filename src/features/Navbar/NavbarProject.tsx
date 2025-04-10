import { blurOnEnter } from "utils/html";
import { BiTrash } from "react-icons/bi";
import { SiAudiomack, SiMidi } from "react-icons/si";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { useOfflineTick } from "hooks/useTick";
import { format, percentize } from "utils/math";
import { GiCompactDisc, GiLoad, GiSave } from "react-icons/gi";
import classNames from "classnames";
import { useSelect, useDispatch } from "hooks/useStore";
import { setProjectName } from "types/Meta/MetaSlice";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { selectLastArrangementTick } from "types/Arrangement/ArrangementSelectors";
import { createProject, clearProject } from "types/Project/ProjectFunctions";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { exportProjectToJSON } from "types/Project/ProjectExporters";
import { exportProjectToMIDI } from "types/Project/ProjectExporters";
import {
  NavbarFormInput,
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { NEW_PROJECT_NAME } from "types/Meta/MetaTypes";
import { useToggle } from "hooks/useToggle";
import {
  DOWNLOAD_TRANSPORT,
  stopDownloadingTransport,
} from "types/Transport/TransportTypes";
import { downloadTransport } from "types/Transport/TransportThunks";

export function NavbarProjectMenu() {
  const dispatch = useDispatch();
  const download = useToggle(DOWNLOAD_TRANSPORT);

  const endTick = useSelect(selectLastArrangementTick);
  const tick = useOfflineTick();
  const downloadProgress = download.isOpen ? percentize(tick, 0, endTick) : 0;
  const downloadPercent = format(downloadProgress, 0);
  const hasDownloaded = downloadProgress >= 100;
  const projectName = useSelect(selectProjectName);
  const [name, setName] = useState("");
  const updateName = useCallback(
    () => dispatch(setProjectName(name.trim())),
    [name]
  );
  useEffect(() => setName(projectName), [projectName]);

  return (
    <div className="group/tooltip relative shrink-0">
      {/* Button */}
      <div className="rounded-full p-1 pr-0">
        <GiCompactDisc className="size-full text-2xl select-none cursor-pointer group-hover/tooltip:text-indigo-500" />
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip
        borderColor="border-indigo-500"
        top="top-[1.875rem]"
        bgColor="bg-radial from-slate-900 to-zinc-900 -left-8 backdrop-blur"
      >
        <div className="size-full py-1 space-y-1.5 min-w-48">
          {/* Project Name */}
          <div>
            <NavbarFormInput
              id="projectName"
              className="w-full focus:bg-indigo-950/50 py-2 mb-2"
              type="text"
              placeholder={NEW_PROJECT_NAME}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => blurOnEnter(e, updateName)}
              onBlur={updateName}
            />
            <label
              htmlFor="projectName"
              className={`absolute text-xs text-indigo-400 duration-300 transform scale-75 top-1 z-10 origin-0 bg-slate-900/80 rounded px-1 left-4`}
            >
              Project Name
            </label>
          </div>

          {/* Open New Project */}
          <NavbarFileGroup onClick={() => createProject()}>
            <NavbarFileLabel>Open New Project</NavbarFileLabel>
            <GiCompactDisc className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Save Project */}
          <NavbarFileGroup onClick={() => dispatch(exportProjectToJSON())}>
            <NavbarFileLabel>Save to JSON</NavbarFileLabel>
            <GiLoad className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Load Project */}
          <NavbarFileGroup onClick={() => readLocalProjects()}>
            <NavbarFileLabel>Load From JSON</NavbarFileLabel>
            <GiSave className="ml-auto text-2xl" />
          </NavbarFileGroup>

          {/* Export to WAV */}
          <NavbarFormGroup
            className={`h-8 space-x-4 ${
              !endTick
                ? "text-slate-500"
                : "hover:bg-indigo-500/25 cursor-pointer"
            }`}
            onClick={!endTick ? undefined : () => dispatch(downloadTransport())}
          >
            <NavbarFileLabel>Export to WAV</NavbarFileLabel>
            <div className="relative flex flex-col text-2xl">
              <SiAudiomack className="text-2xl" />
              {download.isOpen && (
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
                    onClick={stopDownloadingTransport}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </NavbarFormGroup>

          {/* Export to MIDI */}
          {
            <NavbarFormGroup
              className={classNames(
                `h-8 space-x-4`,
                { "text-slate-500": !endTick },
                { "hover:bg-indigo-500/25 cursor-pointer": !!endTick }
              )}
              onClick={() => !!endTick && dispatch(exportProjectToMIDI())}
            >
              <NavbarFileLabel>Export to MIDI</NavbarFileLabel>
              <SiMidi className="text-2xl" />
            </NavbarFormGroup>
          }

          {/* Clear Project */}
          <NavbarFormGroup className="h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer">
            <Menu as="div" className="w-full relative">
              {({ open, close }) => (
                <>
                  <MenuButton className="w-full inline-flex justify-between items-center">
                    <NavbarFormLabel>Clear Project</NavbarFormLabel>
                    <BiTrash className="text-2xl" />
                  </MenuButton>
                  {open && (
                    <MenuItems className="animate-in fade-in zoom-in-95 absolute flex flex-col items-center top-[2.5rem] -left-3 p-2 bg-slate-900 border border-red-500 text-xs rounded">
                      <div className="w-full text-center pb-1 mb-1 font-bold border-b border-b-slate-500/50">
                        Are you sure?
                      </div>
                      <span className="text-xs whitespace-nowrap mb-2 text-slate-400">
                        You will lose all unsaved changes.
                      </span>
                      <div className="flex w-full total-center gap-2 *:w-1/2 *:px-2 *:py-1 *:rounded *:border">
                        <button
                          className="border-red-500 hover:text-red-500"
                          onClick={() => clearProject()}
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
                    </MenuItems>
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

export function NavbarFileGroup(
  props: ComponentProps<typeof NavbarFormGroup> & { hover?: string }
) {
  return (
    <NavbarFormGroup
      {...props}
      className={classNames(
        props.hover ?? "hover:bg-indigo-500/25 cursor-pointer",
        "px-2 h-8 space-x-4",
        props.className
      )}
    />
  );
}

export function NavbarFileLabel({ children }: { children: React.ReactNode }) {
  return (
    <NavbarFormLabel className="w-24 hover:opacity-95 active:opacity-100 whitespace-nowrap">
      {children}
    </NavbarFormLabel>
  );
}
