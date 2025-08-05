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

      <RankDistributions cands={cands} />

      <div style={{ height: "8%" }}></div>

      <WeightedTransfers cands={cands} allChordData={allChordData} />

      <div style={{ height: "8%" }}></div>

      <LaterChoices cands={cands} />
    </div>
  );
}

export default App;
