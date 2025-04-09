import { useAnimation } from "hooks/useAnimation";
import { clamp } from "lodash";
import { useEffect, useState } from "react";
import { normalize } from "utils/math";
import { getContext } from "tone";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { InstrumentId } from "types/Instrument/InstrumentTypes";

interface InstrumentEditorAnalyserProps {
  id: InstrumentId;
  type: "fft" | "waveform";
  isPlaying: boolean;
  className?: string;
}

export function InstrumentEditorAnalyser(props: InstrumentEditorAnalyserProps) {
  const { type, isPlaying } = props;
  const instance = LIVE_AUDIO_INSTANCES[props.id];
  const frameDuration = 5;
  const render = getContext().destination.context.transport.state !== "started";

  // Clear the buffer when the instrument changes
  const [buffer, setBuffer] = useState<number[]>([]);
  const clearBuffer = () => {
    setBuffer(new Array(2048).fill(0));
  };
  useEffect(() => {
    setTimeout(() => clearBuffer(), 100);
  }, [instance?.key]);

  /** Animate the fft/waveform with custom normalization for each */
  useAnimation(
    () => {
      if (instance?.[type] !== undefined) {
        if (type === "fft") {
          const buffer = instance[type].getValue();
          const minDB = -90;
          const maxDB = 0;
          const normalizedBuffer = buffer.map((x) => {
            const scaledSample = (x - minDB) / (maxDB - minDB);
            return clamp(scaledSample, -1, 1);
          });
          setBuffer(Array.from(normalizedBuffer));
        } else {
          const buffer = instance[type].getValue();
          const minDB = -60;
          const maxDB = -40;
          const scale = Math.pow(10, (maxDB - minDB) / 40);
          const normalizedBuffer = buffer.map((x) => {
            const scaledSample = scale * x;
            return clamp(scaledSample, -1, 1);
          });
          setBuffer(Array.from(normalizedBuffer));
        }
      }
    },
    frameDuration,
    render
  );

  // Phase in the analyser when the instrument starts playing
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const steps = 20;
    const duration = 500;
    let timers: NodeJS.Timeout[] = [];

    // Iterate over the number of steps and set the phase
    for (let i = 0; i <= steps; i++) {
      const timer = setTimeout(() => {
        let value = normalize(i, 0.5, steps);
        if (!isPlaying) value = 1 - value;

        // Format and clamp the phase value
        value = Math.round(100 * value) / 100;
        value = clamp(value, 0.5, 1);
        setPhase(value);
      }, (duration / steps) * i);
      timers.push(timer);
    }

    // Clear the timers when the component unmounts
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isPlaying]);

  /** Draw the fft/waveform in a canvas */
  useEffect(() => {
    if (!render) return;
    const canvas = document.getElementById(
      `bufferCanvas-${type}`
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = `rgb(60, 80, 105, ${phase.toFixed(1)})`;
    const barWidth = Math.ceil(canvas.width / buffer.length);

    buffer.forEach((sample, i) => {
      const x = i * barWidth;
      const barHeight = Math.floor(-sample * 40) + 25;
      ctx.fillRect(x, barHeight, barWidth, 5);
    });
  }, [buffer, render, type]);

  return (
    <div
      data-render={render}
      className="w-full h-[85px] bg-slate-900/75 data-[render=true]:bg-slate-900 text-slate-400 data-[render=true]:text-slate-100 my-2 flex flex-col flex-1 flex-shrink-0 border border-slate-500 rounded-lg overflow-hidden"
    >
      <div className="text-xs p-1 border-b border-b-slate-400">
        {props.type === "fft" ? "Frequency" : "Amplitude"}
      </div>
      <canvas
        style={{ backgroundColor: `rgb(15, 25, 45, ${phase.toFixed(1)})` }}
        id={`bufferCanvas-${type}`}
        className="w-full bg-transparent"
        height={"80"}
      />
    </div>
  );
}
