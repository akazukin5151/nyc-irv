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
  percInFooter,
  SEQUENTIAL_COLORS_SOLID,
  SEQUENTIAL_COLORS_TRANS,
  type Setter,
} from "./core";
import { Sticky } from "./Sticky";

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
    allNVotes.length === 0
      ? "xxx"
      : allNVotes[idx] == null
        ? "xxx"
        : (new Intl.NumberFormat("en-US").format(allNVotes[idx]) ?? "xxx");

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
      const str = choice_num === 2 ? "nd" : choice_num === 3 ? "rd" : "th";

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

  let cur_cand_last_name = "";
  if (firstChoiceCand != null) {
    cur_cand_last_name = firstChoiceCand.split(" ").pop() ?? "";
  }

  return (
    <>
      <h2>Later choices</h2>
      <Sticky
        height={42}
        className={`mb-2 inline-flex w-full flex-wrap justify-center`}
      >
        <p>
          For the <span className="font-mono">{nVotes}</span> voters who ranked
        </p>
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
      </Sticky>

      <div className="mb-6 h-[calc(100vh*0.8)]">
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
              plugins: {
                tooltip: {
                  footerFont: { weight: "normal" },
                  callbacks: {
                    title: (c) => c[0].formattedValue,
                    label: (c) => {
                      const n = c.formattedValue;
                      const choice_num = c.datasetIndex + 2;
                      const str =
                        choice_num === 1
                          ? "st"
                          : choice_num === 2
                            ? "nd"
                            : choice_num === 3
                              ? "rd"
                              : "th";
                      if (c.label === "Exhausted") {
                        return `${n} ${cur_cand_last_name} voters exhausted their ballot by the ${choice_num}${str} choice`;
                      }
                      return `${n} ${cur_cand_last_name} voters ranked ${c.label} as their ${choice_num}${str} choice`;
                    },
                    footer: percInFooter,
                  },
                },
              },
            }}
          />
        )}
      </div>

      {(sankeyChartData.datasets[0].data.length ?? 0) > 0 && (
        <div style={{ maxHeight: "calc(100vh - 40px)" }}>
          <h2 className="mb-1">Sankey</h2>
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
    </>
  );
}
