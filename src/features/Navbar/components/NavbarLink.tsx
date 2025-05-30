import { Link } from "react-router-dom";
import { MAIN, useRoute } from "app/router";

export const NavbarLink = ({ v, l }: { v: string; l?: string }) => {
  const view = useRoute();
  return (
    <Link
      key={v}
      to={l ?? v}
      data-onplay={view === MAIN}
      data-isplay={v === MAIN}
      data-selected={view === v}
      className="capitalize font-semilight text-slate-500 data-[isplay=true]:max-sm:hidden data-[onplay=true]:data-[selected=false]:hidden data-[isplay=true]:text-sky-500 data-[isplay=false]:data-[selected=true]:text-slate-200 data-[isplay=false]:data-[selected=false]:text-slate-500"
    >
      {view === MAIN && v === MAIN
        ? "Opening Calculator..."
        : "Open Calculator"}
    </Link>
  );
};
