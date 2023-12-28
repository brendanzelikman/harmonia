import { useCallback, useEffect, useState } from "react";
import { NavbarFileMenu } from "./NavbarFileMenu";
import { NavbarSettingsMenu } from "./NavbarSettings";
import { NavbarToolkit } from "./NavbarToolkit";
import { NavbarTransport } from "./NavbarTransport";
import { NavbarGroup, NavbarBrand } from "./components";
import { View, views } from "pages";
import { Link } from "react-router-dom";
import { useAuthenticationStatus, useCustomEventListener } from "hooks";
import classNames from "classnames";
import { useOnboardingTour } from "features/Tour";

export function Navbar(props: { view: View }) {
  const { view } = props;
  const auth = useAuthenticationStatus();
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

  // Render the link to the view
  const renderLink = useCallback(
    (v: View) => {
      if (v !== "playground" && isLoadingPlayground) return null;
      const linkClass = classNames(
        "font-semilight",
        { "text-free/70 active:text-free": v === "playground" && auth.isFree },
        { "text-pro/70 active:text-pro": v === "playground" && auth.isPro },
        {
          "text-virtuoso/70 active:text-virtuoso":
            v === "playground" && auth.isVirtuoso,
        },
        { "text-slate-200": v !== "playground" && view === v },
        { "text-slate-500": v !== "playground" && view !== v }
      );
      return (
        <Link to={`/${v}`} className={linkClass}>
          {v === "playground" && isLoadingPlayground
            ? "Loading Playground..."
            : v}
        </Link>
      );
    },
    [isLoadingPlayground, auth, view]
  );

  // Render the links to the views
  const renderLinks = useCallback(() => {
    const visibleViews = views.filter(
      (v) => auth.isAtLeastStatus("pro") || v !== "projects"
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
  }, [isLoadingPlayground, renderLink, auth]);

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
