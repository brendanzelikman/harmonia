import { NavbarTimer } from "./NavbarTimer";
import { NavbarTransportControl } from "./NavbarTransportControl";
import { NavbarVolumeMenu } from "./NavbarVolumeMenu";

export function NavbarTransportSection() {
  return (
    <div className="flex relative h-full bg-slate-950/80 border-l border-l-slate-500/50 px-4 space-x-3 items-center">
      <NavbarVolumeMenu />
      <NavbarTimer />
      <NavbarTransportControl />
    </div>
  );
}
