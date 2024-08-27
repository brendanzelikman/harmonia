import classNames from "classnames";
import { NavbarBrand } from "./content/NavbarBrand";
import { NavbarContent } from "./content/NavbarContent";
import { View } from "pages/MainPage";

export interface NavbarProps {
  view: View;
}

export function Navbar(props: NavbarProps) {
  return (
    <div
      id="navbar"
      className={classNames(
        "absolute inset-0 h-nav px-3 z-20",
        "flex flex-nowrap flex-shrink-0 items-center",
        "bg-slate-900 border-b-0.5 border-b-slate-700 shadow-xl",
        "transition-all animate-in fade-in font-nunito text-2xl"
      )}
    >
      <NavbarBrand />
      <NavbarContent {...props} />
    </div>
  );
}
