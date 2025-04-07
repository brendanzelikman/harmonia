import {
  HomeControlBar,
  HomeControlButton,
} from "pages/components/HomeControlBar";
import { HomeContainer } from "pages/components/HomeContainer";
import {
  getSampleDataFromIDB,
  SampleData,
  UPDATE_SAMPLES_EVENT,
} from "providers/samples";
import { useEffect, useState } from "react";
import { GiAudioCassette } from "react-icons/gi";
import { SampleFormatter } from "./SampleFormatter";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { promptUserForSample } from "types/Track/PatternTrack/PatternTrackThunks";
import { useDispatch } from "types/hooks";
import { HomeList } from "pages/components/HomeList";

export const SamplesPage = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<SampleData[]>([]);

  const fetchData = async () => setData(await getSampleDataFromIDB());
  useCustomEventListener(UPDATE_SAMPLES_EVENT, fetchData);

  useEffect(() => {
    fetchData();
  }, []);

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
        {data.map((data) => (
          <SampleFormatter key={data.key} data={data} />
        ))}
      </HomeList>
    </HomeContainer>
  );
};
