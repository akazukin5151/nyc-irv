import { useState } from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Colors,
  type ChartData,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import {
  SEQUENTIAL_COLORS_SOLID,
  SEQUENTIAL_COLORS_TRANS,
  type Setter,
} from "./core";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
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

type FirstChoiceAnalysisProps = {
  cands: Array<string>;
  allNVotes: Array<number>;
  laterChoices: Array<Array<string>>;
  setLaterChoices: Setter<Array<Array<string>>>;
};

export function FirstChoiceAnalysis({
  cands,
  allNVotes,
  laterChoices,
  setLaterChoices,
}: FirstChoiceAnalysisProps) {
  const [firstChoiceCand, setFirstChoiceCand] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const idx = cands.findIndex((c) => c === firstChoiceCand);
  const nVotes = firstChoiceCand == null ? "xxx" : allNVotes[idx].toString();

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

    const cand_rank_freqs = cands
      .filter((cand) => cand !== firstChoiceCand)
      .map((cand) => {
        // for all voters, find the position they ranked this `cand`
        const ranks = laterChoices.map((ballot) =>
          ballot.findIndex((choice) => choice === cand),
        );
        const freqs: Array<number> = Array(4).fill(0);
        for (const rank of ranks) {
          if (rank >= 0) {
            freqs[rank] += 1;
          }
        }
        return freqs;
      });

    const exhausted_freqs: Array<number> = Array(4).fill(0);
    laterChoices.forEach((ballot) => {
      for (let i = 0; i < exhausted_freqs.length; i++) {
        if (ballot.length <= i) {
          exhausted_freqs[i] += 1;
        }
      }
    });
    cand_rank_freqs.push(exhausted_freqs);

    for (let choice_idx = 0; choice_idx < 4; choice_idx++) {
      const choice_num = choice_idx + 2;
      const str = choice_num === 2 ? "nd" : choice_idx === 3 ? "rd" : "th";

      const data = cand_rank_freqs.map((freqs) => freqs[choice_idx]);

      const dataset = {
        label: `${choice_num}${str} choice`,
        data,
        backgroundColor: SEQUENTIAL_COLORS_TRANS[choice_idx + 1],
        borderColor: SEQUENTIAL_COLORS_TRANS[choice_idx + 1],
      };
      datasets.push(dataset);
    }

    chartData.datasets = datasets;

    const flows: Map<string, Map<string, number>> = new Map();
    laterChoices.forEach((ballot) => {
      for (let i = 0; i < ballot.length + 1; i++) {
        if (i === ballot.length && i + 2 === 6) {
          continue;
        }

        const prev_choice = i === 0 ? firstChoiceCand : ballot[i - 1];
        const this_choice = i === ballot.length ? "Exhausted" : ballot[i];

        const from = `${i + 1}: ${prev_choice}`;
        const to = `${i + 2}: ${this_choice}`;

        const inner_map = flows.get(from);
        if (inner_map != null) {
          const flow = inner_map.get(to);
          if (flow != null) {
            inner_map.set(to, flow + 1);
          } else {
            inner_map.set(to, 1);
          }
        } else {
          const inner_map = new Map();
          inner_map.set(to, 1);
          flows.set(from, inner_map);
        }
      }
    });

    for (const [from, inner_map] of flows.entries()) {
      for (const [to, flow] of inner_map.entries()) {
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
    const idx = cands.findIndex((c) => c === cand);
    const res = await fetch(`/later_choices/${idx}.bin`);
    const bytes = await res.bytes();

    const later_choices: Array<Array<string>> = [];
    let i = 0;
    while (i < bytes.length) {
      const this_voters_choices = [];
      const arr_length = bytes[i];
      i += 1;
      for (let _j = 0; _j < arr_length; _j++) {
        const cand_idx = bytes[i];
        const cand = cands[cand_idx];
        this_voters_choices.push(cand);
        // this will increment on the last item of the ballot as well,
        // pointing to the next ballot's `arr_length`. this is fine.
        // the for loop will end and the next iteration of the while loop
        // will read the new item into `arr_length`.
        i += 1;
      }

      later_choices.push(this_voters_choices);
    }

    setLaterChoices(later_choices);
    setIsComputing(false);
  };

  return (
    <>
      <h2>Later choices</h2>
      <div className="mb-2 inline-flex">
        <p>For the</p>
        <p className="mx-2 font-mono">{nVotes}</p>
        <p> voters who ranked</p>
        <select
          className="mx-2 rounded-md border-1 px-2"
          defaultValue="null"
          onChange={(evt) => {
            setIsComputing(true);
            const cand = evt.target.value;
            setFirstChoiceCand(cand);
            handleCandidateSelect(cand);
          }}
        >
          <option disabled value="null">
            ---Please select a candidate---
          </option>
          {cands.map((cand) => (
            <option value={cand} key={cand}>
              {cand}
            </option>
          ))}
        </select>
        <p>first, their later choices were:</p>
      </div>

      {!(isComputing || (chartData.labels?.length ?? 0) > 0) ? (
        <div className="h-full">
        <p>Please select a candidate first</p>
        </div>
      ) : (
        <div style={{ height: "80%" }} className="mb-6">
          {isComputing ? (
            <div className="h-full w-full rounded-xl bg-neutral-100"></div>
          ) : (
            (chartData.labels?.length ?? 0) > 0 && (
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
            )
          )}
        </div>
      )}

      {(isComputing || (sankeyChartData.datasets[0].data.length ?? 0) > 0) && (
        <div className="h-full pb-3">
          <h2>Sankey</h2>
          {isComputing ? (
            <div className="h-full w-full rounded-xl bg-neutral-100"></div>
          ) : (
            (sankeyChartData.datasets[0].data.length ?? 0) > 0 && (
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
            )
          )}
        </div>
      )}
    </>
  );
}
