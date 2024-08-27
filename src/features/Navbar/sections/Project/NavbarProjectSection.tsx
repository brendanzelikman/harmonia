import { NavbarDiaryButton } from "./NavbarDiaryButton";
import { NavbarFileMenu } from "./NavbarFileMenu";
import { NavbarSettingsMenu } from "./NavbarSettingsMenu";
import { NavbarTourButton } from "./NavbarTourButton";

export function NavbarProjectSection() {
  return (
    <div className="flex size-full items-center space-x-1 px-2">
      <NavbarFileMenu />
      <NavbarSettingsMenu />
      <NavbarDiaryButton />
      <NavbarTourButton />
    </div>
  );
}
