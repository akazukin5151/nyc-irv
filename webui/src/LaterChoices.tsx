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
  CANDIDATE_COLORS,
  getCandColor,
  handleCandidateSelectCore,
  numToOrdinal,
  percInFooter,
  radioStyle,
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

type BarChartData = ChartData<"bar", Array<number>, string>;

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
  cands: Array<string>;
};

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

export function LaterChoices({ cands }: LaterChoicesProps) {
  const [allFirstPrefs, setAllFirstPrefs] = useState<Array<number>>([]);
  const [firstChoiceCand, setFirstChoiceCand] = useState<string | null>(null);

  const initChartData: BarChartData = {
    labels: [],
    datasets: [],
  };

  const [chartData, setChartData] = useState<BarChartData>(initChartData);

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
    useState<SankeyChartData>(initSankeyChartData);

  function onSankeyColorChange(sankeyColor: SankeyColor) {
    setSankeyChartData((s) => ({
      datasets: [
        {
          data: s.datasets[0].data,
          colorFrom: (c) => {
            const sd = c.dataset.data[c.dataIndex] as SankeyData;
            if (sankeyColor === "rank") {
              return SEQUENTIAL_COLORS_SOLID[sd.fromIdx - 1];
            }
            return CANDIDATE_COLORS[sd.fromCand];
          },
          colorTo: (c) => {
            const sd = c.dataset.data[c.dataIndex] as SankeyData;
            if (sankeyColor === "rank") {
              return SEQUENTIAL_COLORS_SOLID[sd.toIdx - 1];
            }
            return CANDIDATE_COLORS[sd.toCand];
          },
        },
      ],
    }));
  }

  useEffect(() => {
    if (cands.length === 0 || firstChoiceCand != null) {
      return;
    }

    const fn = async () => {
      const newFirstCand = cands[0];
      setFirstChoiceCand(newFirstCand);

      fetch("n_first_prefs.tsv")
        .then((x) => x.text())
        .then((n_first_prefs_tsv) => {
          const n_first_prefs = n_first_prefs_tsv
            .split("\t")
            .map((s) => parseInt(s));
          setAllFirstPrefs(n_first_prefs);
        });

      await setupChart(newFirstCand, cands, setChartData, setSankeyChartData);
    };

    fn();
  }, [cands, firstChoiceCand]);

  let cur_cand_last_name = "";
  if (firstChoiceCand != null) {
    cur_cand_last_name = firstChoiceCand.split(" ").pop() ?? "";
  }

  const idx = cands.findIndex((c) => c === firstChoiceCand);
  const nFirstPrefs =
    allFirstPrefs.length === 0
      ? "xxx"
      : allFirstPrefs[idx] == null
        ? "xxx"
        : (new Intl.NumberFormat("en-US").format(allFirstPrefs[idx]) ?? "xxx");

  return (
    <section className="h-[calc(100vh*2.1)] rounded-md bg-white shadow-md">
      <h2 className="ml-4 pt-2">Later choices</h2>
      <Sticky className={`mb-2 inline-flex w-full flex-wrap justify-center`}>
        <p>
          For the <output className="font-mono">{nFirstPrefs}</output> voters
          who ranked
        </p>
        <select
          className="mx-2 rounded-md border-1 px-2"
          onChange={async (evt) => {
            const cand = evt.target.value;
            setFirstChoiceCand(cand);
            await setupChart(cand, cands, setChartData, setSankeyChartData);
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

      <div className="mb-6 h-[calc(100vh*0.8)] px-1">
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
                      const str = numToOrdinal(choice_num);
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
          <h2 className="mb-1 ml-4">Sankey</h2>

          <div className="mx-4">
            <p className="mb-1">
              This is similar to the Icicle chart in the beginning, but only
              shows the preferences for voters that ranked{" "}
              <span
                className="underline decoration-3"
                style={{
                  textDecorationColor: getCandColor(firstChoiceCand),
                }}
              >
                {firstChoiceCand}
              </span>{" "}
              first.
            </p>

            <label className="mr-4">
              <input
                type="radio"
                name="sankey-colors"
                className={radioStyle + " mr-1"}
                defaultChecked
                onChange={() => onSankeyColorChange("cand")}
              />
              Color by candidate
            </label>
            <label>
              <input
                type="radio"
                name="sankey-colors"
                className={radioStyle + " mr-1"}
                onChange={() => onSankeyColorChange("rank")}
              />
              Color by position on ballot
            </label>
          </div>

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
    </section>
  );
}
