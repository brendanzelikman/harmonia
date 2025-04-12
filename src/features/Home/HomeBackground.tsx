import { useRoute } from "app/router";
import { Background } from "components/Background";

export const HomeBackground = () => {
  const view = useRoute();
  return view === "playground" ? null : <Background />;
};
