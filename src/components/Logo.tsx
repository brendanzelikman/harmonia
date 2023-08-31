interface LogoProps {
  height?: string;
  width?: string;
  onClick?: () => void;
}

export default function Logo(props: LogoProps) {
  return (
    <img
      src="logo.png"
      onClick={props.onClick}
      style={{ height: props.height, width: props.width }}
    />
  );
}
