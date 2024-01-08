import LogoImage from "assets/images/logo.png";
import { SubscriptionContext, useSubscription } from "providers/subscription";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";

export function NavbarBrand() {
  const { pathname } = useLocation();
  const { isAtLeastStatus } = useSubscription();
  const projectPath = isAtLeastStatus("maestro") ? "/projects" : "/demos";
  const onProjects = pathname === projectPath;
  const to = onProjects ? "/" : projectPath;
  const notOnPlayground = pathname !== "/playground";

  return (
    <Link to={to} className="flex items-center text-white gap-4">
      <img src={LogoImage} alt="Logo" className="xl:w-10 xl:h-10 w-8 h-8" />
      {notOnPlayground && <span className="text-3xl">Harmonia</span>}
    </Link>
  );
}
