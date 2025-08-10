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
  type ChartDataset,
  type TooltipItem,
} from "chart.js";
import { Bar } from "solid-chartjs";
import {
  GRAY,
  numToOrdinal,
  percInFooter,
  SEQUENTIAL_COLORS_TRANS,
} from "./core";
import { axisLabelColor, useTheme } from "./themeColors";
import { createResource, Match, onMount, Show, Switch } from "solid-js";

type ChartType = "bar";
type ChartDataType = Array<number>;
type BarChartData = ChartData<ChartType, ChartDataType, string>;

async function fetchRankDistributions(
  cands: Array<string>,
): Promise<BarChartData> {
  onMount(() => {
    ChartJS.register(
      Tooltip,
      Legend,
      CategoryScale,
      LinearScale,
      BarElement,
      BarController,
      Colors,
    );
  });

  const x = await fetch("rank-distributions.tsv");
  const tsv = await x.text();
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

  const datasets: Array<ChartDataset<ChartType, ChartDataType>> = [];
  for (let rank = 0; rank < rank_dist_data.length; rank++) {
    const label = rank === 5 ? "Unranked" : `Rank ${rank + 1}`;
    const color = rank === 5 ? GRAY : SEQUENTIAL_COLORS_TRANS[rank];
    datasets.push({
      label,
      data: rank_dist_data[rank],
      backgroundColor: color,
    });
  }

  return { labels: cands, datasets };
}

type RankDistributionsProps = {
  cands: Array<string>;
};

export function RankDistributions(props: RankDistributionsProps) {
  const initChartData: BarChartData = {
    labels: [],
    datasets: [],
  };

  const [chartData] = createResource<BarChartData, Array<string>>(
    () => props.cands,
    fetchRankDistributions,
    {
      initialValue: initChartData,
      ssrLoadFrom: "initial",
    },
  );
  const isDark = useTheme();

  return (
    <section class="h-[calc(max(90%,400px))]">
      <h2 class="ml-4 pt-2">Distributions of ranks received by candidate</h2>

      <p class="ml-4 dark:text-white">
        Some candidates are mostly voter's second or later choices.
      </p>

      <div class="h-[85%] rounded-xl bg-white px-1 shadow-md dark:bg-neutral-800">
        <Show when={chartData.loading}>Cands loading</Show>
        <Switch>
          <Match when={chartData.error}>Cands error</Match>
          <Match when={chartData().datasets.length > 0}>
            <Bar
              data={chartData()}
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
                    ticks: {
                      color: axisLabelColor(isDark()),
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    footerFont: { weight: "normal" },
                    callbacks: {
                      title: (context: Array<TooltipItem<ChartType>>) =>
                        context[0].formattedValue,
                      label: (c: TooltipItem<ChartType>) => {
                        const n = c.formattedValue;
                        const choice_num = c.datasetIndex + 1;
                        if (choice_num === 6) {
                          return `${n} voters did not rank ${c.label}`;
                        }
                        const str = numToOrdinal(choice_num);
                        return `${n} voters ranked ${c.label} as their ${choice_num}${str} choice`;
                      },
                      footer: percInFooter,
                    },
                  },
                  legend: {
                    labels: {
                      color: axisLabelColor(isDark()),
                    },
                  },
                },
              }}
            />
          </Match>
        </Switch>
      </div>
    </section>
  );
}
