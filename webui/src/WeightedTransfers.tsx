import { useState } from "react";
import { Chord } from "./Chord";

type WeightedTransfersProps = {
  cands: Array<string>;
  allChordData: Array<Array<Array<number>>>;
};

const metrics = [
  { name: "Borda", dataIdx: 1 },
  { name: "Geometric", dataIdx: 3 },
  { name: "Harmonic", dataIdx: 2 },
  { name: "Inverse square", dataIdx: 4 },
  { name: "First transfer", dataIdx: 0 },
] as const;

type MetricName = (typeof metrics)[number]["name"];

export function WeightedTransfers({
  cands,
  allChordData,
}: WeightedTransfersProps) {
  const [metricName, setMetricName] = useState<MetricName>("First transfer");

  return (
    <div>
      <h2>Transfers</h2>

      <div className="flex items-center">
        <div className="flex min-w-[150px] flex-col">
          {metrics.map(({ name: m }) => (
            <label
              htmlFor={m}
              className="flex items-center rounded-xl px-2 py-2 transition-all hover:bg-sky-100"
            >
              <input
                key={m}
                type="radio"
                id={m}
                name="weighting-metric"
                className={`mr-2 box-content h-1 w-1 appearance-none rounded-full border border-[5px] border-white bg-white bg-clip-padding ring-1 ring-gray-300 outline-none checked:border-blue-400 checked:ring-blue-500`}
                checked={metricName === m}
                onClick={() => setMetricName(m)}
              />
              {m}
            </label>
          ))}
        </div>

        <div className="flex w-full justify-center">
          {cands.length > 0 && allChordData.length > 0 && (
            <Chord
              matrix={
                allChordData[
                  metrics.find((m) => m.name === metricName)?.dataIdx ?? 0
                ]
              }
              colors={[
                "#ffad00",
                "#f27b32",
                "#4f3797",
                "#0d447c",
                "#b2e061",
                "#7eb0d5",
                "#b28b34",
                "#f9b615",
                "#1b3c98",
              ]}
              names={[...cands, "Exhausted"]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
