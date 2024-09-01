import { NavbarDiaryButton } from "./Project/NavbarDiaryButton";
import { NavbarFileMenu } from "./Project/NavbarFileMenu";
import { NavbarSettingsMenu } from "./Project/NavbarSettingsMenu";
import { NavbarTourButton } from "./Project/NavbarTourButton";
import { NavbarUndoRedo } from "./Project/NavbarUndoRedo";

export function NavbarProjectSection() {
  return (
    <div className="flex size-full items-center gap-1 pr-2">
      <NavbarFileMenu />
      <NavbarSettingsMenu />
      <NavbarDiaryButton />
      <NavbarTourButton />
      <NavbarUndoRedo />
    </div>
  );
}
