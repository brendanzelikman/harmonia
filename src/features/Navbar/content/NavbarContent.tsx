import { useEventListener } from "hooks";
import { useState, useEffect } from "react";
import { NavbarPlaygroundContent } from "./NavbarPlaygroundContent";
import { NavbarDefaultContent } from "./NavbarDefaultContent";
import { NavbarProps } from "../Navbar";

export function NavbarContent(props: NavbarProps) {
  const { view } = props;

  // Listen for the playground to load
  const [didLoad, setDidLoad] = useState(false);
  useEventListener("playground-loaded", (e) => setDidLoad(e.detail));

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
    <NavbarDefaultContent
      view={view}
      isLoadingPlayground={isLoadingPlayground}
    />
  );
}
