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
import { GRAY, SEQUENTIAL_COLORS_TRANS } from "./core";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
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
            }}
          />
        )}
      </div>
    </>
  );
}
