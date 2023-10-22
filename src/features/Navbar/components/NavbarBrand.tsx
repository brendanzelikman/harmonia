import LogoImage from "assets/images/logo.png";

export function NavbarBrand() {
  return (
    <a href="/harmonia/" className="select-none">
      <img src={LogoImage} alt="Logo" className="w-10 h-10" />
    </a>
  );
}
