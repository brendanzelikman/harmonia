import classNames from "classnames";
import {
  HomeListItem,
  HomeListButtonContainer,
  HomeListButton,
  HomeListDeleteMenu,
  HomeListTitle,
  HomeListSubtitle,
} from "pages/components/HomeList";
import {
  downloadSampleFromIDB,
  deleteSampleFromIDB,
  SampleData,
} from "providers/samples";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { GiAudioCassette, GiSoundWaves } from "react-icons/gi";
import { now, Player } from "tone";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { format } from "utils/math";

export const SampleFormatter = (props: { data: SampleData }) => {
  const { key, buffer, projectNames, samplerCounts } = props.data;
  const projectText = projectNames.length ? projectNames.join(", ") : "None";

  // An audio player is stored to preview the sample
  const [player, setPlayer] = useState<Player | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const canStop = elapsedTime || isPlaying;

  const play = useCallback(() => {
    if (!player) {
      const newPlayer = new Player(buffer).toDestination();
      setPlayer(newPlayer);
      newPlayer.start(now(), elapsedTime);
    } else {
      player.start(now(), elapsedTime);
    }
    if (player)
      player.onstop = () => {
        setElapsedTime(0);
        setIsPlaying(false);
      };

    setStartTime(now());
    setIsPlaying(true);
  }, [player, elapsedTime, buffer]);

  const pause = useCallback(() => {
    if (player && isPlaying) {
      setElapsedTime((prev) => prev + (now() - startTime));
      player.stop();
      setIsPlaying(false);
    }
  }, [player, isPlaying, startTime]);

  const stop = useCallback(() => {
    if (player) {
      player.stop();
      setElapsedTime(0);
      setIsPlaying(false);
    }
  }, [player]);

  // The user must confirm before deleting a sample
  const [deleting, setDeleting] = useState(false);
  useHotkeys("esc", () => setDeleting(false));

  return (
    <HomeListItem key={key}>
      <div className="size-full flex flex-col justify-between gap-4 shrink mx-auto order-1 data-[demo=true]:text-slate-400 data-[demo=false]:text-indigo-200/70">
        <div className="flex bg-slate-900/50 text-slate-50 p-3 border-2 rounded border-indigo-300/50 group">
          <div className="w-full select-none text-sm font-thin">
            <HomeListTitle title={getInstrumentName(key)} fontSize="text-lg" />
            <HomeListSubtitle
              title="Duration"
              titleColor="text-indigo-300"
              body={`${format(buffer.duration, 2)} seconds`}
            />
            <HomeListSubtitle
              title="Projects:"
              titleColor="text-sky-300"
              body={projectText}
            />
            <HomeListSubtitle
              title="Samplers:"
              titleColor="text-emerald-300"
              body={`${samplerCounts} in total`}
            />
          </div>
          {/* Collapsed icon */}
          <GiAudioCassette className="min-[800px]:hidden border-2 p-2 text-indigo-200/80 my-auto text-7xl rounded-full border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25 bg-gradient-radial from-indigo-700 to-sky-500 shadow-[0px_0px_20px_rgb(100,100,200)]" />
        </div>

        <GiSoundWaves
          data-deleting={deleting}
          onMouseDown={() => {
            if (elapsedTime > 0 && !isPlaying) {
              play();
            } else if (elapsedTime > 0 && isPlaying) {
              pause();
            } else if (isPlaying) {
              stop();
            } else {
              play();
            }
          }}
          onMouseUp={() => {
            if (elapsedTime > 0 && isPlaying) {
              pause();
            } else if (elapsedTime > 0 && !isPlaying) {
              play();
            } else if (isPlaying) {
              stop();
            } else {
              play();
            }
          }}
          className="max-[800px]:hidden cursor-pointer my-auto w-full ease-out p-6 h-fit rounded-full border-2 transition-all active:text-indigo-200 hover:duration-150 border-indigo-400/50 ring-indigo-600/25 ring-offset-8 ring-offset-indigo-500/25 bg-gradient-radial from-indigo-700 to-sky-500 data-[deleting=true]:from-red-500 data-[deleting=true]:to-red-700 shadow-[0px_0px_20px_rgb(100,100,200)]"
        />
      </div>
      <HomeListButtonContainer>
        <HomeListButton onClick={isPlaying ? pause : play}>
          {isPlaying ? "Pause" : "Play"}
        </HomeListButton>
        <HomeListButton
          border={canStop ? "border border-red-400" : undefined}
          disabled={!canStop}
          onClick={stop}
        >
          Stop
        </HomeListButton>
        <HomeListButton onClick={() => downloadSampleFromIDB(key)}>
          Save
        </HomeListButton>
        <HomeListButton onClick={() => setDeleting((prev) => !prev)}>
          Delete
          {deleting && (
            <HomeListDeleteMenu onClick={() => deleteSampleFromIDB(key)} />
          )}
        </HomeListButton>
      </HomeListButtonContainer>
    </HomeListItem>
  );
};
