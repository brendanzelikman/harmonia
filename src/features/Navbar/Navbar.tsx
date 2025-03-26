import { NavbarBrand } from "./components/NavbarBrand";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState, useEffect } from "react";
import { NavbarHomeContent } from "./NavbarHomeContent";
import { NavbarPlaygroundContent } from "./NavbarPlaygroundContent";
import { useRouterPath } from "router";

export function Navbar() {
  return (
    <div className="absolute flex flex-nowrap shrink-0 items-center inset-0 bg-slate-900 border-b-0.5 border-b-slate-700 shadow-xl h-nav px-3 z-[100] transition-all animate-in fade-in font-nunito text-2xl">
      <NavbarBrand />
      <NavbarContent />
    </div>
  );
}

function NavbarContent() {
  const view = useRouterPath();

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
  return <NavbarHomeContent isLoadingPlayground={isLoadingPlayground} />;
}
