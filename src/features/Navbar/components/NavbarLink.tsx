import { Link, useLocation } from "react-router-dom";
import { SPLASH, CALCULATOR } from "app/router";
import { getContext } from "tone";

export const NavbarLink = ({ v, l }: { v: string; l?: string }) => {
  const { pathname } = useLocation();
  return (
    <Link
      key={v}
      to={l ?? v}
      data-onplay={pathname === CALCULATOR}
      data-isplay={v === CALCULATOR}
      data-selected={pathname === v}
      className="capitalize select-none font-semilight text-slate-500 data-[isplay=true]:max-sm:text-base data-[onplay=true]:data-[selected=false]:hidden data-[isplay=true]:text-sky-500 data-[isplay=false]:data-[selected=true]:text-slate-200 data-[isplay=false]:data-[selected=false]:text-slate-500"
    >
      {pathname === SPLASH
        ? "Open Calculator"
        : getContext().state === "running"
        ? "Loading Calculator..."
        : "Click to Start Audio"}
    </Link>
  );
};
