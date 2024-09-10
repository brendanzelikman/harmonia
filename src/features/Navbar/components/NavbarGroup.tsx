import { PropsWithChildren } from "react";
import { toolkitBackground } from "./NavbarStyles";
import { use } from "types/hooks";
import { selectTimelineType } from "types/Timeline/TimelineSelectors";
import classNames from "classnames";

interface NavbarGroupProps extends React.HTMLProps<HTMLDivElement> {
  useTypeBackground?: boolean;
}

export function NavbarGroup(props: PropsWithChildren<NavbarGroupProps>) {
  const { useTypeBackground, ...rest } = props;
  const type = use(selectTimelineType);
  const bgColor = useTypeBackground ? toolkitBackground[type] : undefined;
  return (
    <div
      {...rest}
      className={classNames(
        rest.className,
        bgColor,
        `px-3 gap-2 h-full flex shrink-0 total-center transition-all`
      )}
    >
      {rest.children}
    </div>
  );
}
