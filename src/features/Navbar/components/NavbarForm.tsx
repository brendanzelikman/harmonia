import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { blurOnEnter } from "utils/html";

export const NavbarFormGroup = (props: any) => (
  <div
    className={`w-full flex justify-between items-center group px-2 relative rounded ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const NavbarFormLabel = (props: any) => (
  <label
    className={`text-sm text-slate-100 group-focus-within:text-shadow pointer-events-none ${
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
    className={`block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border border-slate-400 focus:border-slate-300 focus:ring-0 appearance-none ${
      props.className ?? ""
    }`}
    onKeyDown={(e) => {
      props.onKeyDown?.(e);
      blurOnEnter(e);
    }}
  />
);

export const NavbarFormButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => (
  <button
    {...props}
    className={`w-full border py-1 rounded-lg appearance-none text-sm ${
      props.className ?? ""
    } `}
  >
    {props.children}
  </button>
);
