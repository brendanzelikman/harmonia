import { Link } from "react-router-dom";
import { useRoute } from "app/router";

export const NavbarLink = ({ v }: { v: string }) => {
  const view = useRoute();
  return (
    <Link
      key={v}
      to={`/${v}`}
      data-onplay={view === "playground"}
      data-isplay={v === "playground"}
      data-selected={view === v}
      className="capitalize font-semilight text-slate-500 data-[onplay=true]:data-[selected=false]:hidden data-[isplay=true]:text-sky-500 data-[isplay=false]:data-[selected=true]:text-slate-200 data-[isplay=false]:data-[selected=false]:text-slate-500"
    >
      {view === "playground" && v === "playground"
        ? "Opening Playground..."
        : v}
    </Link>
  );
};
