import { NavbarGroup } from "../components";
import { NavbarArrangementSection } from "../sections/NavbarArrangementSection";
import { NavbarProjectSection } from "../sections/NavbarProjectSection";
import { NavbarToolkitSection } from "../sections/NavbarToolkitSection";
import { NavbarTransportSection } from "../sections/NavbarTransportSection";

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
