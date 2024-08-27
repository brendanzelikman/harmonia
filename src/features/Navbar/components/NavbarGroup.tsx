export function NavbarGroup(props: any) {
  return (
    <div
      {...props}
      className={`${
        props.className ?? ""
      } h-full flex justify-center items-center`}
      role="group"
    >
      {props.children}
    </div>
  );
}
