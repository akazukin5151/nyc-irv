import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Colors,
  type ChartData,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import {
  handleCandidateSelectCore,
  SEQUENTIAL_COLORS_SOLID,
  SEQUENTIAL_COLORS_TRANS,
  type Setter,
} from "./core";
import "./LaterChoices.css";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,

  Colors,
  SankeyController,
  Flow,
);

type SankeyData = {
  from: string;
  to: string;
  flow: number;
  fromIdx: number;
  toIdx: number;
};

type LaterChoicesProps = {
  cands: Array<string>;
  allNVotes: Array<number>;
  laterChoices: Array<Array<number>>;
  setLaterChoices: Setter<Array<Array<number>>>;
  flowData: Record<string, Record<string, number>>;
  setFlowData: Setter<Record<string, Record<string, number>>>;
};

export function LaterChoices({
  cands,
  allNVotes,
  laterChoices,
  setLaterChoices,
  flowData,
  setFlowData,
}: LaterChoicesProps) {
  const [firstChoiceCand, setFirstChoiceCand] = useState<string | null>(null);

  useEffect(() => {
    if (cands.length > 0 && firstChoiceCand == null) {
      handleCandidateSelect(cands[0]);
    }
  }, [cands, firstChoiceCand]);

  const idx = cands.findIndex((c) => c === firstChoiceCand);
  const nVotes =
    allNVotes.length === 0 ? "xxx" : (allNVotes[idx]?.toString() ?? "xxx");

  const chartData: ChartData<"bar", Array<number>, string> = {
    labels: [],
    datasets: [],
  };

  const sankeyChartData: ChartData<"sankey", Array<SankeyData>, string> = {
    datasets: [
      {
        data: [],
        colorFrom: (c) => {
          const sd = c.dataset.data[c.dataIndex] as SankeyData;
          return SEQUENTIAL_COLORS_SOLID[sd.fromIdx - 1];
        },
        colorTo: (c) => {
          const sd = c.dataset.data[c.dataIndex] as SankeyData;
          return SEQUENTIAL_COLORS_SOLID[sd.toIdx - 1];
        },
        // TODO: not working
        // column: {
        //   "2. Exhausted": 1,
        //   "3. Exhausted": 2,
        //   "4. Exhausted": 3,
        // },
      },
    ],
  };

  if (laterChoices.length > 0 && firstChoiceCand != null) {
    chartData.labels = [
      ...cands.filter((cand) => cand !== firstChoiceCand),
      "Exhausted",
    ];
    const datasets = [];

    for (let choice_idx = 0; choice_idx < 4; choice_idx++) {
      const choice_num = choice_idx + 2;
      const str = choice_num === 2 ? "nd" : choice_idx === 3 ? "rd" : "th";

      const data = laterChoices.map((freqs) => freqs[choice_idx]);

      const dataset = {
        label: `${choice_num}${str} choice`,
        data,
        backgroundColor: SEQUENTIAL_COLORS_TRANS[choice_idx + 1],
        borderColor: SEQUENTIAL_COLORS_TRANS[choice_idx + 1],
      };
      datasets.push(dataset);
    }

    chartData.datasets = datasets;

    for (const [from, inner_map] of Object.entries(flowData)) {
      for (const [to, flow] of Object.entries(inner_map)) {
        sankeyChartData.datasets[0].data.push({
          from,
          to,
          flow,
          fromIdx: parseInt(from.slice(0, 1)),
          toIdx: parseInt(to.slice(0, 1)),
        });
      }
    }
  }

  const handleCandidateSelect = async (cand: string) => {
    setFirstChoiceCand(cand);
    const idx = cands.findIndex((c) => c === cand);
    handleCandidateSelectCore(idx, setLaterChoices, setFlowData);
  };

  return (
    <>
      <h2>Later choices</h2>
      <div className="sticky-blurred-div sticky top-0 z-1 mb-2 inline-flex w-full flex-wrap justify-center px-1 py-2">
        <p>For the</p>
        <p className="mx-2 font-mono">{nVotes}</p>
        <p> voters who ranked</p>
        <select
          className="mx-2 rounded-md border-1 px-2"
          onChange={(evt) => {
            handleCandidateSelect(evt.target.value);
          }}
        >
          {cands.map((cand) => (
            <option value={cand} key={cand}>
              {cand}
            </option>
          ))}
        </select>
        <p>first, their later choices were:</p>
      </div>
      <div className="shadow-under-blur" />
      <div className="relative">
        <div className="shadow-coverer" />
      </div>

      <div style={{ height: "80%" }} className="mb-6">
        {(chartData.labels?.length ?? 0) > 0 && (
          <Chart
            type="bar"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: "y",
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
          />
        )}
      </div>

      {(sankeyChartData.datasets[0].data.length ?? 0) > 0 && (
        <div className="h-full">
          <h2>Sankey</h2>
          <Chart
            type="sankey"
            data={sankeyChartData}
            options={{
              animation: false,
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: "y",
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
              },
            }}
          />
        </div>
      )}

      <div style={{ height: "10%" }}></div>
    </>
  );
}
