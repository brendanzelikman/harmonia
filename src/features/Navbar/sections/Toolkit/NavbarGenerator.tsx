import { NavbarTooltipButton } from "components/TooltipButton";
import { GiRuleBook } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { createNestedTracks } from "types/Track/ScaleTrack/ScaleTrackThunks";

export const NavbarGenerator = () => {
  const dispatch = useProjectDispatch();

  return (
    <NavbarTooltipButton
      label={"Create Track Tree"}
      borderColor="border-sky-500"
      onClick={() => dispatch(createNestedTracks)}
    >
      <GiRuleBook />
    </NavbarTooltipButton>
  );
};
