import { HomeContainer } from "features/Home/HomeContainer";
import { useNavigate } from "react-router-dom";
import { useHotkeys } from "hooks/useHotkeys";
import { DemosControl } from "./DemosControl";
import { DemosList } from "./DemosList";

export default function DemosPage() {
  const navigate = useNavigate();
  useHotkeys({ enter: () => navigate("/playground") });
  return (
    <HomeContainer>
      <DemosControl />
      <DemosList />
    </HomeContainer>
  );
}
