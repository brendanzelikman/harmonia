import LogoImage from "assets/images/logo.png";
import { Link } from "react-router-dom";
import { useRoute } from "app/router";

export function NavbarBrand() {
  const view = useRoute();
  const route = view === "playground" ? "/projects" : "/";
  return (
    <Link to={route} className="flex items-center text-white shrink-0">
      <img src={LogoImage} alt="Logo" className="size-10" />
      {view !== "playground" && (
        <span className="ml-4 max-lg:hidden text-3xl">Harmonia</span>
      )}
    </Link>
  );
}
