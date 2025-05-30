import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { MAIN } from "app/router";
import { HomeControlBar } from "features/Home/HomeControlBar";
import { DEMO_GENRES } from "lib/demos";
import { useCallback } from "react";
import { GiCompactDisc } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { loadDemoProject } from "types/Project/ProjectLoaders";
import { blurEvent } from "utils/event";

export const DemosControl = () => {
  const navigate = useNavigate();
  const callback = useCallback(() => navigate(MAIN), [navigate]);
  return (
    <HomeControlBar>
      {DEMO_GENRES.map((genre) => (
        <Popover className="relative" key={genre.key}>
          <PopoverButton
            className={`w-36 max-lg:w-12 total-center gap-2 h-12 rounded-3xl xl:rounded-md capitalize border text-xl font-light ${genre.color} select-none cursor-pointer focus:outline-none`}
            onFocus={blurEvent}
          >
            {genre.icon} <span className="max-lg:hidden">{genre.key}</span>
          </PopoverButton>
          <PopoverPanel
            anchor="bottom"
            className="flex animate-in fade-in zoom-in-50 flex-col p-2 min-w-36 gap-2 mt-1 bg-slate-950/70 backdrop-blur border border-slate-500 rounded"
          >
            {genre.demos.map((demo) => (
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-85"
                key={demo.project.meta.id}
                onClick={() => loadDemoProject(demo.project, callback)}
              >
                <GiCompactDisc />
                {demo.project.meta.name}
              </div>
            ))}
          </PopoverPanel>
        </Popover>
      ))}
      <div className="h-12 w-0" />
    </HomeControlBar>
  );
};
