import { HomeContainer } from "features/Home/HomeContainer";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "hooks/useHotkeys";
import { DemosControl } from "./DemosControl";
import { DemosList } from "./DemosList";
import { MAIN } from "app/router";

export default function DemosPage() {
  const navigate = useNavigate();
  useHotkeys({ enter: () => navigate(MAIN) });
  return (
    <HomeContainer>
      <DemosControl />
      <DemosList />
    </HomeContainer>
  );
}
