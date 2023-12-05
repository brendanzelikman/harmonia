import classNames from "classnames";
import { NavbarButton } from ".";

export const NavbarToolkitButton = (props: {
  className?: string;
  children: any;
  onClick?: () => void;
  label?: string;
}) => (
  <NavbarButton
    {...props}
    className={classNames(
      props.className,
      `border rounded-full xl:text-2xl text-xl`
    )}
  >
    {props.children}
  </NavbarButton>
);
