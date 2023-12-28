import LogoImage from "assets/images/logo.png";
import { useAuthenticationStatus } from "hooks";
import { Link, useLocation } from "react-router-dom";

export function NavbarBrand() {
  const { pathname } = useLocation();
  const auth = useAuthenticationStatus();
  const projectPath = auth.isAtLeastStatus("pro") ? "/projects" : "/demos";
  const onProjects = pathname === projectPath;
  const to = onProjects ? "/" : projectPath;
  const notOnPlayground = pathname !== "/playground";

  return (
    <Link reloadDocument to={to} className="flex items-center text-white gap-4">
      <img src={LogoImage} alt="Logo" className="xl:w-10 xl:h-10 w-8 h-8" />
      {notOnPlayground && <span className="text-3xl">Harmonia</span>}
    </Link>
  );
}
