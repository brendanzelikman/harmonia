import LogoImage from "assets/images/logo.png";
import { Link } from "react-router-dom";

export function NavbarBrand() {
  return (
    <Link reloadDocument to="/projects">
      <img src={LogoImage} alt="Logo" className="xl:w-10 xl:h-10 w-8 h-8" />
    </Link>
  );
}
