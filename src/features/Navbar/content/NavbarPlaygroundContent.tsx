import { NavbarGroup } from "../components";
import { NavbarArrangementSection } from "../sections/Arrangement/NavbarArrangementSection";
import { NavbarProjectSection } from "../sections/Project/NavbarProjectSection";
import { NavbarToolkitSection } from "../sections/Toolkit/NavbarToolkitSection";
import { NavbarTransportSection } from "../sections/Transport/NavbarTransportSection";

export function NavbarPlaygroundContent() {
  return (
    <div className="size-full flex text-slate-50">
      <NavbarGroup>
        <NavbarProjectSection />
      </NavbarGroup>
      <NavbarGroup>
        <NavbarTransportSection />
      </NavbarGroup>
      <NavbarGroup>
        <NavbarToolkitSection />
      </NavbarGroup>
      <NavbarGroup>
        <NavbarArrangementSection />
      </NavbarGroup>
    </div>
  );
}
