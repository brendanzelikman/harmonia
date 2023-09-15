import useAnimationFrame from "hooks/useAnimationFrame";
import { clamp } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { INSTRUMENTS, PatternTrack } from "types";

interface AnalyserProps {
  track: PatternTrack;
  type: "fft" | "waveform";
  render?: boolean;
}

export function InstrumentAnalyser(props: AnalyserProps) {
  const { track, type, render } = props;
  const mixer = INSTRUMENTS[track?.id]?.mixer;

  const [buffer, setBuffer] = useState<number[]>([]);
  const clearBuffer = () => {
    setBuffer(new Array(2048).fill(0));
  };

  const frameDuration = 3;
  useAnimationFrame(
    () => {
      if (mixer[type] !== undefined) {
        if (type === "fft") {
          const buffer = mixer[type].getValue();
          const minDB = -90;
          const maxDB = 0;
          const normalizedBuffer = buffer.map((x) => {
            const scaledSample = (x - minDB) / (maxDB - minDB);
            return clamp(scaledSample, -1, 1);
          });
          setBuffer(Array.from(normalizedBuffer));
        } else {
          const buffer = mixer[type].getValue();
          const minDB = -60;
          const maxDB = -45;
          const scale = Math.pow(10, (maxDB - minDB) / 20);
          const normalizedBuffer = buffer.map((x) => {
            const scaledSample = x * scale;
            return clamp(scaledSample, -1, 1);
          });
          setBuffer(Array.from(normalizedBuffer));
        }
      }
    },
    frameDuration,
    render
  );

  useEffect(() => {
    setTimeout(() => clearBuffer(), 100);
  }, [track?.instrument]);

  const Buffer = useCallback(
    () =>
      !render ? (
        <div className="w-full h-full flex flex-row justify-center items-center"></div>
      ) : (
        buffer.map((sample, i) => {
          return (
            <div
              key={i}
              className={`w-2 h-1 ${
                render ? "bg-slate-400/80" : "bg-slate-600/80"
              }`}
              style={{ marginBottom: `${sample * 40}px` }}
            />
          );
        })
      ),
    [buffer, render]
  );

  return (
    <div
      className={`w-full h-[85px] my-2 flex flex-col flex-shrink-0 ${
        render
          ? "bg-slate-900 text-slate-100"
          : "bg-slate-900/75 text-slate-400"
      } border border-slate-500 rounded-lg overflow-hidden`}
    >
      <label className="text-xs  p-1 border-b border-b-slate-400">
        {props.type === "fft" ? "Frequency" : "Amplitude"}
      </label>
      <div className="flex flex-1 h-full justify-center items-center p-1">
        {Buffer()}
      </div>
    </div>
  );
}
