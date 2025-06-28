import classNames from "classnames";
import { InputHTMLAttributes, PropsWithChildren } from "react";
import { blurOnEnter } from "utils/event";

export const NavbarFormGroup = (
  props: PropsWithChildren<React.HTMLProps<HTMLDivElement>>
) => (
  <div
    className={classNames(
      `w-full flex justify-between items-center group px-2 relative rounded`,
      props.className
    )}
    onClick={props.onClick}
  >
    {props.children}
  </div>
);

export const NavbarFormLabel = (
  props: PropsWithChildren<React.HTMLProps<HTMLLabelElement>>
) => (
  <label
    className={`text-sm group-focus-within:text-shadow pointer-events-none ${
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
    className={`block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none ${
      props.className ?? ""
    }`}
    onKeyDown={(e) => {
      props.onKeyDown?.(e);
      blurOnEnter(e);
    }}
  />
);

export const NavbarTitleForm = (props: NavbarFormInputProps) => {
  return (
    <input
      {...props}
      className={classNames(
        props.className,
        "text-base w-full border-b border-b-slate-500 text-slate-100 bg-slate-950/80 focus:bg-slate-950 rounded-lg font-light pb-1"
      )}
      type="text"
      readOnly
      disabled
    />
  );
};
