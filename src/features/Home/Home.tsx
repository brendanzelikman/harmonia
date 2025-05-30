import { Navbar } from "features/Navbar/Navbar";
import { useProject } from "hooks/useProject";
import { useWindow } from "hooks/useWindow";
import Playground from "features/Playground/Playground";

export function HomePage() {
  useProject();
  useWindow();
  return (
    <div className="size-full relative pt-nav">
      <Playground />
      <Navbar />
    </div>
  );
}
