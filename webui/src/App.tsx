import { useEffect, useState } from "react";
import { FirstChoiceAnalysis } from "./FirstChoiceAnalysis";
import { RankDistributions } from "./RankDistributions";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
  const [allNVotes, setAllNVotes] = useState<Array<number>>([]);
  const [laterChoices, setLaterChoices] = useState<Array<Array<string>>>([]);
  const [rankDistData, setRankDistData] = useState<Array<Array<number>>>([]);

  useEffect(() => {
    const fn = async () => {
      const promises = [
        fetch("sorted_cands.tsv"),
        fetch("n_voters.tsv"),
        fetch("rank-distributions.tsv"),
      ];
      const res = await Promise.all(promises);
      const texts = await Promise.all(res.map((r) => r.text()));

      const cands_csv = texts[0];
      const cands = cands_csv.split("\t").filter((cand) => cand !== "");
      setCands(cands);

      const n_votes = texts[1].split("\t").map((s) => parseInt(s));
      setAllNVotes(n_votes);

      const rank_distributions_csv = texts[2].split("\n");
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
    };

    fn();
  }, []);

  return (
    <div className="h-screen p-2">
      <RankDistributions cands={cands} rankDistData={rankDistData} />

      <FirstChoiceAnalysis
        cands={cands}
        allNVotes={allNVotes}
        laterChoices={laterChoices}
        setLaterChoices={setLaterChoices}
      />
    </div>
  );
}

export default App;
