import LogoImage from "assets/images/logo.png";
import { useAuth } from "providers/auth";
import { Link, useLocation } from "react-router-dom";

export function NavbarBrand() {
  const { pathname } = useLocation();
  const { isAtLeastRank } = useAuth();
  const projectPath = isAtLeastRank("maestro") ? "/projects" : "/demos";
  const onProjects = pathname === projectPath;
  const to = onProjects ? "/" : projectPath;
  const notOnPlayground = pathname !== "/playground";

  return (
    <Link to={to} className="flex items-center text-white shrink-0">
      <img src={LogoImage} alt="Logo" className="size-10" />
      {notOnPlayground && <span className="ml-3 text-3xl">Harmonia</span>}
    </Link>
  );
}
