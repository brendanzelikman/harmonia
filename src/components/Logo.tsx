import LogoImage from "assets/images/logo.png";

interface LogoProps {
  className?: string;
  height?: string;
  width?: string;
  onClick?: () => void;
}

export function Logo(props: LogoProps) {
  return (
    <img
      src={LogoImage}
      onClick={props.onClick}
      className={props.className}
      style={{ height: props.height, width: props.width }}
    />
  );
}
