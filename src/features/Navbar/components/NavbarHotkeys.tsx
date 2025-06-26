import { some } from "lodash";
import { memo, PropsWithChildren } from "react";

export const NavbarHotkeyKey = (
  label: string,
  active = false,
  slow = false
) => {
  return (
    <span
      data-active={active}
      data-slow={slow}
      className="data-[active=true]:text-slate-200 transition-all data-[slow=true]:data-[active=false]:duration-1000 data-[slow=true]:data-[active=true]:duration-75"
    >
      {label}
    </span>
  );
};

export const NavbarHotkeyInstruction = memo(
  (props: { active: boolean; label: string }) => (
    <span
      className={props.active ? "text-white text-shadow-lg" : "text-slate-400"}
    >
      {props.label}
    </span>
  )
);

export type NavbarHotkeyDescriptionActiveProps =
  | { active: boolean }
  | {
      active: (key: string) => boolean;
      keycodes: readonly string[];
      required?: readonly string[];
    };

export type NavbarHotkeyDescriptionProps = {
  label: string;
  activeClass: string;
  defaultClass: string;
} & NavbarHotkeyDescriptionActiveProps;

export const NavbarHotkeyDescription = memo(
  (props: NavbarHotkeyDescriptionProps) => {
    const { label, active, activeClass, defaultClass } = props;
    const isActive =
      typeof active === "boolean"
        ? active
        : some(props.keycodes, active) &&
          (props.required ? some(props.required, active) : true);
    return (
      <span
        className={isActive ? `${activeClass} text-shadow-lg` : defaultClass}
      >
        {label}
      </span>
    );
  }
);

export type NavbarTypedHotkeyDescriptionProps = {
  label: string;
} & NavbarHotkeyDescriptionActiveProps;

export const NavbarScaleDescription = memo(
  (props: NavbarTypedHotkeyDescriptionProps) => (
    <NavbarHotkeyDescription
      {...props}
      defaultClass="text-sky-400"
      activeClass="text-sky-300"
    />
  )
);
export const NavbarScaleBox = (props: PropsWithChildren) => (
  <div className="px-2 py-1 bg-gradient-to-r from-sky-500/40 to-sky-500/20 rounded">
    {props.children}
  </div>
);

export const NavbarPatternDescription = memo(
  (props: NavbarTypedHotkeyDescriptionProps) => (
    <NavbarHotkeyDescription
      {...props}
      defaultClass="text-emerald-300"
      activeClass="text-emerald-200"
    />
  )
);

export const NavbarPatternBox = (props: PropsWithChildren) => (
  <div className="px-2 py-1 bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded">
    {props.children}
  </div>
);

export const NavbarPoseDescription = memo(
  (props: NavbarTypedHotkeyDescriptionProps) => (
    <NavbarHotkeyDescription
      {...props}
      defaultClass="text-fuchsia-300"
      activeClass="text-fuchsia-200"
    />
  )
);

export const NavbarPoseBox = (props: PropsWithChildren) => (
  <div className="px-2 py-1 bg-gradient-to-r from-fuchsia-500/40 to-fuchsia-500/20 rounded">
    {props.children}
  </div>
);

export const NavbarInstructionDescription = memo(
  (props: NavbarTypedHotkeyDescriptionProps) => (
    <NavbarHotkeyDescription
      {...props}
      defaultClass="text-slate-400"
      activeClass="text-white"
    />
  )
);
