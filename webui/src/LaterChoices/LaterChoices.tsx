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
  type TooltipItem,
} from "chart.js";
import { Bar } from "solid-chartjs";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import {
  CANDIDATE_COLORS,
  getCandColor,
  numToOrdinal,
  percInFooter,
  radioStyle,
  SEQUENTIAL_COLORS_SOLID,
  SEQUENTIAL_COLORS_TRANS,
} from "../core";
import { Sticky } from "./Sticky";
import { axisLabelColor, useTheme } from "../themeColors";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  type Setter,
} from "solid-js";

type ChartType = "bar";
type BarChartData = ChartData<ChartType, Array<number>, string>;

type SankeyChartData = ChartData<"sankey", Array<SankeyData>, string>;

type SankeyData = {
  from: string;
  to: string;
  flow: number;
  fromIdx: number;
  toIdx: number;
  fromCand: keyof typeof CANDIDATE_COLORS;
  toCand: keyof typeof CANDIDATE_COLORS;
};

type SankeyColor = "rank" | "cand";

type LaterChoicesProps = {
  candsFirstPrefs: [Array<string>, Array<number>];
};

export function LaterChoices(props: LaterChoicesProps) {
  onMount(() => {
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
  });

  const [firstChoiceCand, setFirstChoiceCand] = createSignal<string | null>(
    null,
  );
  const isDark = useTheme();

  const initChartData: BarChartData = {
    labels: [],
    datasets: [],
  };

  const [chartData, setChartData] = createSignal<BarChartData>(initChartData);

  const initSankeyChartData: SankeyChartData = {
    datasets: [
      {
        data: [],
        colorFrom: (c) => {
          const sd = c.dataset.data[c.dataIndex] as SankeyData;
          return CANDIDATE_COLORS[sd.fromCand];
        },
        colorTo: (c) => {
          const sd = c.dataset.data[c.dataIndex] as SankeyData;
          return CANDIDATE_COLORS[sd.toCand];
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

  const [sankeyChartData, setSankeyChartData] =
    createSignal<SankeyChartData>(initSankeyChartData);

  const [sankeyColor, setSankeyColor] = createSignal<"cand" | "rank">("cand");

  function onSankeyColorChange(newSankeyColor: SankeyColor) {
    setSankeyColor(newSankeyColor);
    setSankeyChartData((s) => ({
      datasets: [
        {
          data: s.datasets[0].data,
          colorFrom: (c) => {
            const sd = c.dataset.data[c.dataIndex] as SankeyData;
            if (newSankeyColor === "rank") {
              return SEQUENTIAL_COLORS_SOLID[sd.fromIdx - 1];
            }
            return CANDIDATE_COLORS[sd.fromCand];
          },
          colorTo: (c) => {
            const sd = c.dataset.data[c.dataIndex] as SankeyData;
            if (newSankeyColor === "rank") {
              return SEQUENTIAL_COLORS_SOLID[sd.toIdx - 1];
            }
            return CANDIDATE_COLORS[sd.toCand];
          },
        },
      ],
    }));
  }

  createEffect(() => {
    const cands = props.candsFirstPrefs[0];
    if (cands.length === 0 || firstChoiceCand() != null) {
      return;
    }

    const fn = async () => {
      const newFirstCand = cands[0];
      setFirstChoiceCand(newFirstCand);
      await setupChart(newFirstCand, cands, setChartData, setSankeyChartData);
    };

    fn();
  });

  const curCandLastName = () => {
    if (firstChoiceCand() != null) {
      return firstChoiceCand()!.split(" ").pop() ?? "";
    }
    return "";
  };

  const nFirstPrefs = () => {
    const idx = props.candsFirstPrefs[0].findIndex(
      (c) => c === firstChoiceCand(),
    );
    const allFirstPrefs = props.candsFirstPrefs[1];
    return allFirstPrefs.length === 0
      ? "xxx"
      : allFirstPrefs[idx] == null
        ? "xxx"
        : (new Intl.NumberFormat("en-US").format(allFirstPrefs[idx]) ?? "xxx");
  };

  return (
    <section class="h-[calc(100vh*2.1)] rounded-md bg-white shadow-md dark:bg-neutral-800">
      <h2 class="ml-4 pt-2">Later choices</h2>
      <Sticky class_={`mb-2 inline-flex w-full flex-wrap justify-center`}>
        <p>
          For the <output class="font-mono">{nFirstPrefs()}</output> voters who
          ranked
        </p>
        <select
          class="mx-2 rounded-md border-1 px-2"
          onChange={(evt) => {
            const cand = evt.target.value;
            setFirstChoiceCand(cand);
            setupChart(
              cand,
              props.candsFirstPrefs[0],
              setChartData,
              setSankeyChartData,
            );
          }}
        >
          <For each={props.candsFirstPrefs[0]}>
            {(cand) => (
              <option value={cand} class="dark:text-black">
                {cand}
              </option>
            )}
          </For>
        </select>
        <p>first, their later choices were:</p>
      </Sticky>

      <div class="mb-6 h-[calc(100vh*0.8)] px-1">
        {(chartData().labels?.length ?? 0) > 0 && (
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
                    title: (c: Array<TooltipItem<ChartType>>) =>
                      c[0].formattedValue,
                    label: (c: TooltipItem<ChartType>) => {
                      const n = c.formattedValue;
                      const choice_num = c.datasetIndex + 2;
                      const str = numToOrdinal(choice_num);
                      if (c.label === "Exhausted") {
                        return `${n} ${curCandLastName()} voters exhausted their ballot by the ${choice_num}${str} choice`;
                      }
                      return `${n} ${curCandLastName()} voters ranked ${c.label} as their ${choice_num}${str} choice`;
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
        )}
      </div>

      {sankeyChartData().datasets[0].data.length > 0 && (
        <div style={{ "max-height": "calc(100vh - 40px)" }}>
          <h2 class="mb-1 ml-4">Sankey</h2>

          <div class="mx-4 dark:text-white">
            <p class="mb-1">
              This is similar to the Icicle chart in the beginning, but only
              shows the preferences for voters that ranked{" "}
              <span
                class="underline decoration-3"
                style={{
                  "text-decoration-color": getCandColor(firstChoiceCand()),
                }}
              >
                {firstChoiceCand()}
              </span>{" "}
              first.
            </p>

            <label class="mr-4">
              <input
                type="radio"
                name="sankey-colors"
                class={radioStyle + " mr-1"}
                checked={sankeyColor() === "cand"}
                onChange={() => onSankeyColorChange("cand")}
              />
              Color by candidate
            </label>
            <label>
              <input
                type="radio"
                name="sankey-colors"
                class={radioStyle + " mr-1"}
                checked={sankeyColor() === "rank"}
                onChange={() => onSankeyColorChange("rank")}
              />
              Color by position on ballot
            </label>
          </div>

          <Bar
            type="sankey"
            data={sankeyChartData()}
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
              color: isDark() ? "white" : "black",
            }}
          />
        </div>
      )}
    </section>
  );
}

async function setupChart(
  firstChoiceCand: string,
  cands: Array<string>,
  setChartData: Setter<BarChartData>,
  setSankeyChartData: Setter<SankeyChartData>,
) {
  const idx = cands.findIndex((c) => c === firstChoiceCand);
  const [laterChoices, flowData] = await handleCandidateSelectCore(idx);

  const labels = [
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

  setChartData({ labels, datasets });

  const sankey_data: Array<SankeyData> = [];
  for (const [from, inner_map] of Object.entries(flowData)) {
    for (const [to, flow] of Object.entries(inner_map)) {
      sankey_data.push({
        from,
        to,
        flow,
        fromIdx: parseInt(from.slice(0, 1)),
        toIdx: parseInt(to.slice(0, 1)),
        fromCand: from.split(" ").pop(),
        toCand: to.split(" ").pop(),
      } as SankeyData);
    }
  }

  setSankeyChartData((s) => ({
    datasets: [{ ...s.datasets[0], data: sankey_data }],
  }));
}

async function handleCandidateSelectCore(
  idx: number,
): Promise<[Array<Array<number>>, Record<string, Record<string, number>>]> {
  const promises = [
    fetch(`later_choices/${idx}.json`).then(async (res) => {
      const json: Array<Array<number>> = await res.json();
      return json;
    }),

    fetch(`flows/${idx}.json`).then(async (res) => {
      const json: Record<string, Record<string, number>> = await res.json();
      return json;
    }),
  ] as const;

  return Promise.all(promises);
}
