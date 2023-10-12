import { InputHTMLAttributes } from "react";
import { blurOnEnter } from "utils";

export const NavbarFormGroup = (props: any) => (
  <div
    className={`flex h-10 relative items-center justify-center w-full text-white rounded cursor-pointer ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const NavbarFormLabel = (props: any) => (
  <label
    className={`text-sm mr-auto mx-2 px-1 font-medium cursor-pointer ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </label>
);

interface NavbarFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export const NavbarFormInput = (props: NavbarFormInputProps) => (
  <input
    {...props}
    className={`h-8 block px-2 bg-transparent rounded-lg text-sm focus:outline-none placeholder-slate-400 focus:ring-0 appearance-none ${
      props.className ?? ""
    }`}
    onKeyDown={(e) => {
      props.onKeyDown?.(e);
      blurOnEnter(e);
    }}
  />
);
