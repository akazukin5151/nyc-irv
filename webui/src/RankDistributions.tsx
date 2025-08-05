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
import { GRAY, percInFooter, SEQUENTIAL_COLORS_TRANS } from "./core";
import { useEffect, useState } from "react";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Colors,
);

type RankDistributionsProps = {
  cands: Array<string>;
};

export function RankDistributions({ cands }: RankDistributionsProps) {
  const [rankDistData, setRankDistData] = useState<Array<Array<number>>>([]);

  useEffect(() => {
    fetch("rank-distributions.tsv")
      .then((x) => x.text())
      .then((tsv) => {
        const rank_distributions_csv = tsv.split("\n");
        const rank_dist_data: Array<Array<number>> = [];
        for (const row of rank_distributions_csv.slice(1)) {
          if (row.length === 0) {
            continue;
          }

          const splitted = row.split("\t");
          const cand_idx = parseInt(splitted[0]);
          const rank = parseInt(splitted[1]) - 1;
          const freq = parseInt(splitted[2]);

          const cand_arr = rank_dist_data[rank] ?? cands.map(() => 0);
          cand_arr[cand_idx] = freq;
          rank_dist_data[rank] = cand_arr;
        }

        setRankDistData(rank_dist_data);
      });
  }, []);

  const chartData: ChartData<"bar", Array<number>, string> = {
    labels: [],
    datasets: [],
  };

  if (rankDistData.length > 0) {
    chartData.labels = cands;
    const datasets = [];

    for (let rank = 0; rank < rankDistData.length; rank++) {
      const label = rank === 5 ? "Unranked" : `Rank ${rank + 1}`;
      const color = rank === 5 ? GRAY : SEQUENTIAL_COLORS_TRANS[rank];
      datasets.push({
        label,
        data: rankDistData[rank],
        backgroundColor: color,
      });
    }

    chartData.datasets = datasets;
  }

  return (
    <div className="h-[calc(max(90%,400px))] rounded-md bg-white shadow-md">
      <h2 className="ml-4 pt-2">
        Distributions of ranks received by candidate
      </h2>

      <p className="ml-4">
        Some candidates are mostly voter's second or later choices.
      </p>

      <div className="h-[85%] px-1">
        {chartData.datasets.length > 0 && (
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
                    title: (context) => context[0].formattedValue,
                    label: (c) => {
                      const n = c.formattedValue;
                      const choice_num = c.datasetIndex + 1;
                      if (choice_num === 6) {
                        return `${n} voters did not rank ${c.label}`;
                      }
                      const str =
                        choice_num === 1
                          ? "st"
                          : choice_num === 2
                            ? "nd"
                            : choice_num === 3
                              ? "rd"
                              : "th";
                      return `${n} voters ranked ${c.label} as their ${choice_num}${str} choice`;
                    },
                    footer: percInFooter,
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
