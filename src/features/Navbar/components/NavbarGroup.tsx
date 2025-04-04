import { PropsWithChildren } from "react";
import classNames from "classnames";

interface NavbarGroupProps extends React.HTMLProps<HTMLDivElement> {
  hide?: boolean;
  useTypeBackground?: boolean;
}

export function NavbarGroup(props: PropsWithChildren<NavbarGroupProps>) {
  const { hide, useTypeBackground, ...rest } = props;
  if (hide) return null;
  return (
    <div
      {...rest}
      className={classNames(
        rest.className,
        `px-3 gap-2 h-full flex shrink-0 total-center text-sm transition-all`
      )}
    >
      {rest.children}
    </div>
  );
}
