import classNames from "classnames";
import { NavbarHoverTooltip } from "./NavbarTooltip";
import { PropsWithChildren, ReactNode } from "react";
import { NavbarFormGroup, NavbarTitleForm } from "./NavbarForm";

type NavbarActionButtonProps = {
  Icon: ReactNode;
  title: string;
  subtitle?: string;
  subtitleClass?: string;
  background?: string;
  borderColor?: string;
  minWidth?: string;
  onClick?: () => void;
};

export const NavbarActionButton = (
  props: PropsWithChildren<NavbarActionButtonProps>
) => {
  return (
    <div className="group/tooltip relative shrink-0">
      {/* Button */}
      <div
        onClick={props.onClick}
        className={classNames(
          props.background,
          "rounded-full size-9 total-center p-1.5 hover:ring transition-all"
        )}
      >
        <div className="size-full shrink-0 text-2xl select-none cursor-pointer group-hover/tooltip:saturate-150">
          {props.Icon}
        </div>
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip
        borderColor={props.borderColor}
        top="top-8"
        bgColor="bg-radial from-slate-900 to-zinc-900 -left-8"
      >
        <div
          className={classNames(
            props.minWidth ?? "min-w-64",
            "size-full py-2 font-light"
          )}
        >
          <NavbarTitleForm className="mb-3" value={props.title} />
          {!!props.subtitle && (
            <div className={classNames(props.subtitleClass, "px-2 text-sm")}>
              {props.subtitle}
            </div>
          )}

          <div
            data-parent={!!props.children}
            className="flex flex-col gap-3 data-[parent=true]:mt-3"
          >
            {props.children}
          </div>
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};

type NavbarActionButtonOptionProps = {
  title: ReactNode;
  className?: string;
  Icon: ReactNode;
  subtitle?: ReactNode;
  stripe?: string;
  readOnly?: boolean;
  onClick?: () => void;
};

export const NavbarActionButtonOption = (
  props: PropsWithChildren<NavbarActionButtonOptionProps>
) => {
  return (
    <div
      className={classNames(
        props.className,
        !!props.readOnly ? "" : "cursor-pointer",
        "border border-slate-500 rounded hover:ring group"
      )}
      onClick={props.onClick}
    >
      <NavbarFormGroup
        className={classNames(
          "px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b",
          props.stripe
        )}
      >
        <div>{props.title}</div>
        <div className="ml-auto text-2xl">{props.Icon}</div>
      </NavbarFormGroup>
      {!!props.subtitle && (
        <div className="text-xs p-1.5 normal-case text-slate-400">
          {props.subtitle}
        </div>
      )}
    </div>
  );
};
