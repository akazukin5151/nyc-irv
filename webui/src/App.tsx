import { useEffect, useState } from "react";
import { LaterChoices } from "./LaterChoices";
import { RankDistributions } from "./RankDistributions";
import { type Tree } from "./core";
import { WeightedTransfers } from "./WeightedTransfers";
import { ExternalLink } from "./ExternalLink";
import { Icicle } from "./Icicle";
import { PairwiseWins } from "./PairwiseWins";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
  const [rankDistData, setRankDistData] = useState<Array<Array<number>>>([]);
  const [allChordData, setAllChordData] = useState<Array<Array<Array<number>>>>(
    [],
  );
  const [treeData, setTreeData] = useState<Tree | null>(null);

  useEffect(() => {
    fetch("sorted_cands.tsv")
      .then((x) => x.text())
      .then((cands_csv) => {
        const cands = cands_csv.split("\t").filter((cand) => cand !== "");
        setCands(cands);

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
      });

    fetch("matrices.json")
      .then((x) => x.json())
      .then((matrices) => setAllChordData(matrices));

    fetch("tree.json")
      .then((x) => x.json())
      .then((tree) => setTreeData(tree));
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-neutral-100 p-6 pt-0">
      <h1 className="mb-3 pt-6">
        2025 New York City Democratic mayoral primary analysis
      </h1>
      <p className="mb-3">
        This is the page containing interactive charts. See{" "}
        <ExternalLink href="https://github.com/akazukin5151/nyc-irv/blob/main/README.md">
          https://github.com/akazukin5151/nyc-irv/blob/main/README.md
        </ExternalLink>{" "}
        for static results
      </p>

      <PairwiseWins />

      <div style={{ height: "8%" }}></div>

      <Icicle treeData={treeData} />

      <div style={{ height: "8%" }}></div>

      <RankDistributions cands={cands} rankDistData={rankDistData} />

      <div style={{ height: "8%" }}></div>

      <WeightedTransfers cands={cands} allChordData={allChordData} />

      <div style={{ height: "8%" }}></div>

      <LaterChoices cands={cands} />
    </div>
  );
}

export default App;
