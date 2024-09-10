import classNames from "classnames";
import { NavbarBrand } from "./components/NavbarBrand";
import { View } from "pages/main";
import { usePlaygroundHotkeys } from "features/Playground/hooks/usePlaygroundHotkeys";
import { useTimelineHotkeys } from "features/Timeline/hooks/useTimelineHotkeys";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState, useEffect } from "react";
import { NavbarHomeContent } from "./NavbarHomeContent";
import { NavbarPlaygroundContent } from "./NavbarPlaygroundContent";

export type NavbarProps = { view: View };

export function Navbar(props: NavbarProps) {
  return (
    <div
      id="navbar"
      className={classNames(
        "absolute inset-0 h-nav px-3 z-[100]",
        "flex flex-nowrap shrink-0 items-center",
        "bg-slate-900 border-b-0.5 border-b-slate-700 shadow-xl",
        "transition-all animate-in fade-in font-nunito text-2xl"
      )}
    >
      <NavbarBrand />
      <NavbarContent {...props} />
    </div>
  );
}

function NavbarContent(props: NavbarProps) {
  const { view } = props;
  usePlaygroundHotkeys();
  useTimelineHotkeys();

  // Listen for the playground to load
  const [didLoad, setDidLoad] = useState(false);
  useCustomEventListener("playground-loaded", (e) => setDidLoad(e.detail));

  // Unload the playground if the view changes
  useEffect(() => {
    if (view !== "playground") setDidLoad(false);
  }, [view]);

  // Render the playground if it should be loaded
  const onPlayground = view === "playground";
  const isLoadingPlayground = onPlayground && !didLoad;
  const shouldLoadPlayground = onPlayground && !!didLoad;
  if (shouldLoadPlayground) return <NavbarPlaygroundContent />;

  // Otherwise, render the default content
  return (
    <NavbarHomeContent view={view} isLoadingPlayground={isLoadingPlayground} />
  );
}
