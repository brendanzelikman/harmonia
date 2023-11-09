import LogoImage from "assets/images/logo.png";

export function NavbarBrand() {
  return (
    <a href="/harmonia/" className="select-none">
      <img src={LogoImage} alt="Logo" className="xl:w-10 xl:h-10 w-8 h-8" />
    </a>
  );
}
