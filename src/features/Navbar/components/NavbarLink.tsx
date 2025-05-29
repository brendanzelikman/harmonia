import { Link } from "react-router-dom";
import { useRoute } from "app/router";
import classNames from "classnames";

export const NavbarLink = ({ v, l }: { v: string; l?: string }) => {
  const view = useRoute();
  const isPlayground = v === "playground";
  return (
    <Link
      key={v}
      to={l ?? `/${v}`}
      data-onplay={view === "playground"}
      data-isplay={v === "playground"}
      data-selected={view === v}
      className={classNames(
        isPlayground ? "max-sm:hidden" : "",
        "capitalize font-semilight text-slate-500 data-[onplay=true]:data-[selected=false]:hidden data-[isplay=true]:text-sky-500 data-[isplay=false]:data-[selected=true]:text-slate-200 data-[isplay=false]:data-[selected=false]:text-slate-500"
      )}
    >
      {view === "playground" && v === "playground"
        ? "Opening Playground..."
        : v}
    </Link>
  );
};
