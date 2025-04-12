import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import { HomeContainer } from "features/Home/HomeContainer";
import { getSampleDataFromIDB, UPDATE_SAMPLES_EVENT } from "app/samples";
import { GiAudioCassette } from "react-icons/gi";
import { SampleFormatter } from "./SampleFormatter";
import { useEvent } from "hooks/useEvent";
import { promptUserForSample } from "lib/prompts/sampler";
import { useAppDispatch } from "hooks/useRedux";
import { HomeList } from "features/Home/HomeList";
import { useFetch } from "hooks/useFetch";

export default function SamplePage() {
  const dispatch = useAppDispatch();
  const { data, fetchData } = useFetch(getSampleDataFromIDB);
  useEvent(UPDATE_SAMPLES_EVENT, fetchData);
  return (
    <HomeContainer>
      <HomeControlBar>
        <HomeControlButton
          className="border-orange-300/90 text-orange-300/90"
          title="Upload Sample"
          icon={<GiAudioCassette />}
          onClick={() => dispatch(promptUserForSample({ data: {} }))}
        />
      </HomeControlBar>
      <HomeList signal={UPDATE_SAMPLES_EVENT}>
        {data !== null &&
          data.map((data) => <SampleFormatter key={data.key} data={data} />)}
      </HomeList>
    </HomeContainer>
  );
}
