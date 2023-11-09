import { NavbarButton } from ".";

export const NavbarToolkitButton = (props: {
  className?: string;
  children: any;
  onClick?: () => void;
  label?: string;
}) => (
  <NavbarButton
    {...props}
    className={`border border-slate-400/50 rounded-full xl:text-2xl text-xl ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </NavbarButton>
);
