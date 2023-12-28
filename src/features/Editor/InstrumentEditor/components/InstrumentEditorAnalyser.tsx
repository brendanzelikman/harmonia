import { useAnimationFrame } from "hooks";
import { clamp } from "lodash";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { normalize } from "utils/math";
import { getContext } from "tone";
import { LiveAudioInstance } from "types/Instrument";

interface InstrumentEditorAnalyserProps {
  type: "fft" | "waveform";
  isPlaying: boolean;
  instance?: LiveAudioInstance;
  className?: string;
}

export function InstrumentEditorAnalyser(props: InstrumentEditorAnalyserProps) {
  const { type, isPlaying, instance } = props;
  const frameDuration = 10;
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
  useAnimationFrame(
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

  // Phase in the analyser when the instrument starts playing
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (isPlaying && phase >= 1) return;
    if (!isPlaying && phase <= 0) return;

    const steps = 20;
    const duration = 500;
    let timers: NodeJS.Timeout[] = [];

    // Iterate over the number of steps and set the phase
    for (let i = 0; i <= steps; i++) {
      const timer = setTimeout(() => {
        let value = normalize(i, 0, steps);
        if (!isPlaying) value = 1 - value;

        // Format and clamp the phase value
        value = Math.round(100 * value) / 100;
        value = clamp(value, 0, 1);
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

  /** The analyser displays its type as the title. */
  const AnalyserTitle = () => (
    <div className="text-xs p-1 border-b border-b-slate-400">
      {props.type === "fft" ? "Frequency" : "Amplitude"}
    </div>
  );

  return (
    <div
      className={classNames(
        props.className,
        "w-full h-[85px] my-2 flex flex-col flex-1 flex-shrink-0 border border-slate-500 rounded-lg overflow-hidden",
        { "bg-slate-900 text-slate-100": render },
        { "bg-slate-900/75 text-slate-400": !render }
      )}
    >
      <AnalyserTitle />
      <canvas
        style={{ backgroundColor: `rgb(15, 25, 45, ${phase.toFixed(1)})` }}
        id={`bufferCanvas-${type}`}
        className="w-full bg-transparent"
        height={"80"}
      />
    </div>
  );
}
