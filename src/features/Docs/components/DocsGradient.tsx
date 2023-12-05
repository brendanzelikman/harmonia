export const DocsGradient = (props: { gradient: string }) => {
  return (
    <div
      className={`absolute inset-0 ${props.gradient} rounded blur-xl opacity-25 -z-20 transition-colors duration-300 ease-in-out`}
    />
  );
};
