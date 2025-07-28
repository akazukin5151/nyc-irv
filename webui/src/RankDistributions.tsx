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
import { GRAY, SEQUENTIAL_COLORS_TRANS } from "./core";

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
  rankDistData: Array<Array<number>>;
};

export function RankDistributions({
  cands,
  rankDistData,
}: RankDistributionsProps) {
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
    <>
      <h2>Rank distributions</h2>

      <div style={{ height: "80%" }}>
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
                    footer: (context) => {
                      const c = context[0];
                      const n = c.dataset.data[c.dataIndex] as number;
                      const sum_of_this_rank = (c.dataset.data.reduce(
                        (a, b) => (a as number) + (b as number),
                        0,
                      ) ?? 0) as number;
                      if (sum_of_this_rank === 0) {
                        return ``;
                      }
                      const perc = new Intl.NumberFormat("en-US", {
                        maximumFractionDigits: 2,
                      }).format((n / sum_of_this_rank) * 100);
                      return `${perc}% of all ${c.dataset.label} votes`;
                    },
                  },
                },
              },
            }}
          />
        )}
      </div>
    </>
  );
}
