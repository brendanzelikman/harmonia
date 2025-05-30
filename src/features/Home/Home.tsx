import { Navbar } from "features/Navbar/Navbar";
import { useProject } from "hooks/useProject";
import { useWindow } from "hooks/useWindow";
import Calculator from "features/Calculator/Calculator";

export function HomePage() {
  useProject();
  useWindow();
  return (
    <div className="size-full relative pt-nav">
      <Navbar />
      <Calculator />
    </div>
  );
}
