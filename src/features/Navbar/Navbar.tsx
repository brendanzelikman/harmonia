import { useCallback, useEffect, useState } from "react";
import { NavbarFileMenu } from "./NavbarFileMenu";
import { NavbarSettingsMenu } from "./NavbarSettings";
import { NavbarToolkit } from "./NavbarToolkit";
import { NavbarTransport } from "./NavbarTransport";
import { NavbarGroup, NavbarBrand } from "./components";
import { View, views } from "pages";
import { Link } from "react-router-dom";
import { useCustomEventListener } from "hooks";
import classNames from "classnames";
import { useOnboardingTour } from "features/Tour";
import { useSubscription } from "providers/subscription";
import { Tooltip, TooltipProvider, TooltipTrigger } from "components/Tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";

export function Navbar(props: { view: View }) {
  const { view } = props;
  const { isProdigy, isMaestro, isVirtuoso, isAtLeastStatus, isDesktop } =
    useSubscription();
  const Tour = useOnboardingTour();

  // Listen for the playground to load
  const [didPlaygroundLoad, setDidPlaygroundLoad] = useState(false);
  useCustomEventListener("playground-loaded", (e) =>
    setDidPlaygroundLoad(e.detail)
  );

  useEffect(() => {
    if (view !== "playground") setDidPlaygroundLoad(false);
  }, [view]);

  // Check if the view is the playground
  const onPlayground = view === "playground";
  const isLoadingPlayground = onPlayground && !didPlaygroundLoad;
  const canPlay = !(isDesktop && !isVirtuoso);

  // Render the link to the view
  const renderLink = useCallback(
    (v: View) => {
      const onPlayground = v === "playground";
      if (!onPlayground && isLoadingPlayground) return null;
      const onProdigy = onPlayground && isProdigy;
      const onMaestro = onPlayground && isMaestro;
      const onVirtuoso = onPlayground && isVirtuoso;
      const invalidPlayground = !canPlay && onPlayground;
      const linkClass = classNames(
        "font-semilight",
        { "text-prodigy/70 active:text-prodigy": onProdigy },
        { "text-maestro/70 active:text-maestro": onMaestro },

        { "text-virtuoso/70 active:text-virtuoso": onVirtuoso },
        { "text-slate-200": !onPlayground && view === v },
        { "text-slate-500": !onPlayground && view !== v }
      );
      if (invalidPlayground) {
        return (
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-slate-700/70 cursor-not-allowed">
                  Playground
                </TooltipTrigger>
                <TooltipContent className="mt-4 mr-2 animate-in fade-in duration-300 p-2 w-48 text-xs text-white bg-slate-900/80 backdrop-blur rounded border border-slate-500 normal-case">
                  You must be a{" "}
                  <Link to="/profile" className="text-virtuoso">
                    Virtuoso
                  </Link>{" "}
                  user to use the Playground on Desktop.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
      return (
        <Link to={`/${v}`} className={linkClass}>
          {onPlayground && isLoadingPlayground ? "Loading Playground..." : v}
        </Link>
      );
    },
    [isLoadingPlayground, isProdigy, isMaestro, isVirtuoso, view]
  );

  // Render the links to the views
  const renderLinks = useCallback(() => {
    const visibleViews = views.filter(
      (v) => isAtLeastStatus("maestro") || v !== "projects"
    );
    const viewCount = visibleViews.length;
    return visibleViews.map((v, i) => {
      const shouldAddDivider = i < viewCount - 1 && !isLoadingPlayground;
      return (
        <div className="flex items-center capitalize" key={`link-${v}`}>
          {renderLink(v)}
          {shouldAddDivider && <span className="mx-4">|</span>}
        </div>
      );
    });
  }, [isLoadingPlayground, isAtLeastStatus, renderLink]);

  /** The default navbar group containing projects, docs, etc. */
  const DefaultNavbarContent = useCallback(() => {
    return (
      <div className={"w-full flex text-slate-500 justify-end pr-2"}>
        {renderLinks()}
      </div>
    );
  }, [renderLinks, onPlayground]);

  /** The playground's navbar group */
  const PlaygroundNavbarContent = useCallback(() => {
    return (
      <div className="w-full flex text-slate-50">
        <NavbarGroup className="ml-3">
          <NavbarFileMenu />
        </NavbarGroup>
        <NavbarGroup className="ml-3">
          <NavbarTransport />
        </NavbarGroup>
        <NavbarGroup className="ml-3">
          <NavbarToolkit />
        </NavbarGroup>
        <NavbarGroup className="relative ml-auto hidden md:flex">
          <NavbarSettingsMenu />
          {Tour.Button}
        </NavbarGroup>
      </div>
    );
  }, [onPlayground, didPlaygroundLoad]);

  const shouldLoadPlayground = onPlayground && !!didPlaygroundLoad;

  const navbarClass = classNames(
    "absolute inset-0 h-nav px-3 z-10",
    "flex flex-nowrap flex-shrink-0 items-center",
    "bg-slate-900 border-b-0.5 border-b-slate-700 shadow-xl",
    "transition-all animate-in fade-in font-nunito text-2xl"
  );

  return (
    <div id="navbar" className={navbarClass}>
      <NavbarBrand />
      <div className="w-full animate-in slide-in-from-bottom">
        {shouldLoadPlayground ? (
          <PlaygroundNavbarContent />
        ) : (
          <DefaultNavbarContent />
        )}
      </div>
    </div>
  );
}
