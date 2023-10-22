import { ReactNode } from "react";

export interface NavbarButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  disabledClass?: string;
  onClick?: () => void;
  label?: string;
}

export function NavbarButton({
  className = "",
  disabled = false,
  disabledClass = "bg-slate-400/30",
  children,
  onClick,
  label,
}: NavbarButtonProps) {
  return (
    <button
      onClick={disabled ? () => null : onClick}
      className={`${className ?? ""} ${
        disabled ? disabledClass : ""
      } flex items-center justify-center rounded focus:outline-none`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
