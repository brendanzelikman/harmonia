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
      } xl:min-w-9 xl:min-h-9 min-w-8 min-h-8 xl:text-2xl text-xl flex items-center justify-center active:opacity-80 opacity-100`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
