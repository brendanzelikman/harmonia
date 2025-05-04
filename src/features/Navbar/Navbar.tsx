import { useEvent } from "hooks/useEvent";
import { useState } from "react";
import { useRoute } from "app/router";
import { NavbarBrand } from "features/Navbar/components/NavbarBrand";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { NavbarGroup } from "./components/NavbarGroup";
import { NavbarProjectMenu } from "./NavbarProject";
import { NavbarUndo, NavbarRedo } from "./NavbarUndoRedo";
import { NavbarArrangeClip } from "./NavbarArrangeClip";
import { NavbarDesignTree } from "./NavbarDesignTree";
import { NavbarLivePlay } from "./NavbarLivePlay";
import { NavbarPortalGun } from "./NavbarPortalGun";
import { NavbarScissors } from "./NavbarScissors";
import { NavbarWaterTree } from "./NavbarWaterTree";
import { NavbarTime } from "./NavbarTime";
import { NavbarTransportControl } from "./NavbarTransportControl";
import { NavbarVolume } from "./NavbarVolume";
import { NavbarLink } from "./components/NavbarLink";
import { LOAD_PLAYGROUND } from "features/Playground/Playground";
import { BsQuestionCircle } from "react-icons/bs";
import { dispatchToggle } from "hooks/useToggle";
import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { ToggleShortcutsHotkey } from "lib/hotkeys/global";
import { NavbarSettings } from "./NavbarSettings";
import { NavbarTape } from "./NavbarTape";
import { NavbarSampleProject } from "./NavbarSampleProject";
import { FaQuestion, FaQuestionCircle } from "react-icons/fa";

export function Navbar() {
  const view = useRoute();
  const hasTracks = useAppValue(selectHasTracks);

  // Listen for the playground to load
  const [didLoad, setDidLoad] = useState(false);
  useEvent(LOAD_PLAYGROUND, (e) => setDidLoad(e.detail));
  const didPlaygroundLoad = view === "playground" && didLoad;

  // Render the playground if it should be loaded
  return (
    <div className="absolute flex flex-nowrap shrink-0 items-center inset-0 bg-slate-900 border-b-[1px] border-b-slate-700 shadow-xl h-nav px-3 z-[140] transition-all animate-in fade-in text-2xl">
      <NavbarBrand />
      {!didPlaygroundLoad ? (
        <div className="w-full flex gap-4 *:pr-4 *:border-r last:*:border-r-0 *:border-r-slate-600 text-slate-500 justify-end pr-2">
          <NavbarLink v="projects" />
          <NavbarLink v="demos" />
          <NavbarLink v="samples" />
          <NavbarLink v="playground" />
        </div>
      ) : (
        <div className="size-full select-none flex animate-in fade-in slide-in-from-top-4 text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
          <NavbarGroup className="w-[250px] gap-3">
            <NavbarProjectMenu />
            <NavbarSettings />
            <NavbarTooltipButton
              keepTooltipOnClick
              hideRing
              className={classNames(
                "select-none hover:opacity-75 text-slate-100"
              )}
              marginLeft={-40}
              marginTop={-2}
              borderColor="border-indigo-400/80"
              onClick={() => dispatchToggle("shortcuts")}
              hotkey={ToggleShortcutsHotkey}
            >
              <FaQuestionCircle className="size-6.5" />
            </NavbarTooltipButton>
            <NavbarUndo />
            <NavbarRedo />
          </NavbarGroup>
          <NavbarGroup className="bg-slate-950/30 border-l border-l-slate-500/50">
            <NavbarVolume />
            <NavbarTime />
            <NavbarTransportControl />
          </NavbarGroup>
          <NavbarGroup className="bg-radial from-slate-900/15 to-sky-500/15">
            <div className="text-base font-light pr-1">Motifs</div>
            <NavbarDesignTree />
            <NavbarArrangeClip type="pattern" />
            <NavbarArrangeClip type="pose" />
          </NavbarGroup>
          <NavbarGroup
            hide={!hasTracks}
            className="bg-radial from-emerald-800/15 to-teal-600/15"
          >
            <div className="text-base font-light pr-1">Trees</div>
            <NavbarSampleProject />
            <NavbarWaterTree />
            <NavbarLivePlay />
          </NavbarGroup>
          <NavbarGroup
            hide={!hasTracks}
            className="bg-radial from-teal-800/15 to-teal-600/15"
          >
            <div className="text-base font-light pr-1">Clips</div>
            <NavbarTape />
            <NavbarScissors />
            <NavbarPortalGun />
          </NavbarGroup>
        </div>
      )}
    </div>
  );
}
