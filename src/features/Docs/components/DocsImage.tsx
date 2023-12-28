export const DocsImage = (props: { src: string; alt: string }) => (
  <img
    src={props.src}
    alt={props.alt}
    className="rounded max-h-80 min-h-80 animate-in fade-in ml-4 ring-2 ring-slate-50/20"
  />
);
