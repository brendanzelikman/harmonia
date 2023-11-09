import { NavbarButton, NavbarButtonProps } from "./NavbarButton";

export const TransportButton = (props: NavbarButtonProps) => (
  <NavbarButton
    {...props}
    className={`border border-slate-400/50 rounded-full xl:text-xl text-lg ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </NavbarButton>
);
