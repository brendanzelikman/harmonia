import { PropsWithChildren } from "react";
import classNames from "classnames";

interface NavbarGroupProps extends React.HTMLProps<HTMLDivElement> {
  hide?: boolean;
  gap?: string;
  useTypeBackground?: boolean;
}

export function NavbarGroup(props: PropsWithChildren<NavbarGroupProps>) {
  const { hide, gap, useTypeBackground, ...rest } = props;
  if (hide) return null;
  return (
    <div
      {...rest}
      className={classNames(
        rest.className,
        gap ?? "gap-2",
        `px-3 h-full flex shrink-0 total-center text-sm transition-all animate-in fade-in`
      )}
    >
      {rest.children}
    </div>
  );
}
export function NavbarGroupLabel(props: PropsWithChildren) {
  return <div className="text-sm font-light pr-1">{props.children}</div>;
}
