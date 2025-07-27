import { useEffect, useState } from "react";
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

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Colors,
);

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
  const [firstChoiceCand, setFirstChoiceCand] = useState<string | null>(null);
  const [allNVotes, setAllNVotes] = useState<Array<number>>([]);
  const [laterChoices, setLaterChoices] = useState<Array<Array<string>>>([]);

  useEffect(() => {
    const fn = async () => {
      const promises = [fetch("/sorted_cands.tsv"), fetch("/n_voters.tsv")];
      const res = await Promise.all(promises);
      const texts = await Promise.all(res.map((r) => r.text()));

      const cands_csv = texts[0];
      const cands = cands_csv.split("\t").filter((cand) => cand !== "");
      setCands(cands);

      const n_votes = texts[1].split("\t").map((s) => parseInt(s));
      setAllNVotes(n_votes);
    };

    fn();
  }, []);

  const idx = cands.findIndex((c) => c === firstChoiceCand);
  const nVotes = firstChoiceCand == null ? "xxx" : allNVotes[idx].toString();

  const chartData: ChartData<"bar", Array<number>, string> = {
    labels: [],
    datasets: [],
  };

  if (laterChoices.length > 0) {
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
      };
      datasets.push(dataset);
    }

    chartData.datasets = datasets;
  }

  return (
    <>
      <p>For the {nVotes} voters who ranked</p>
      <select
        defaultValue="null"
        onChange={async (evt) => {
          const cand = evt.target.value;
          setFirstChoiceCand(cand);

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
        }}
      >
        <option disabled value="null">
          Please select a candidate
        </option>
        {cands.map((cand) => (
          <option value={cand} key={cand}>
            {cand}
          </option>
        ))}
      </select>
      <p>first, their later choices were:</p>

      <Chart
        type="bar"
        data={chartData}
        options={{
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
    </>
  );
}

export default App;
