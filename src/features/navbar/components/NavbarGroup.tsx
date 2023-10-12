export function NavbarGroup(props: any) {
  return (
    <div
      {...props}
      className={`${props.className ?? ""} flex justify-center items-center`}
      role="group"
    >
      {props.children}
    </div>
  );
}
