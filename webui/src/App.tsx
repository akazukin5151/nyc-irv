import { useEffect, useState } from "react";
import { LaterChoices } from "./LaterChoices";
import { RankDistributions } from "./RankDistributions";
import { WeightedTransfers } from "./WeightedTransfers";
import { ExternalLink } from "./ExternalLink";
import { Icicle } from "./Icicle";
import { PairwiseWins } from "./PairwiseWins";
import { PairwiseMatrix } from "./PairwiseMatrix";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);

  useEffect(() => {
    fetch("sorted_cands.tsv")
      .then((x) => x.text())
      .then((cands_csv) => {
        const cands = cands_csv.split("\t").filter((cand) => cand !== "");
        setCands(cands);
      });
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

      <PairwiseMatrix cands={cands} />

      <div style={{ height: "8%" }}></div>

      <Icicle />

      <div style={{ height: "8%" }}></div>

      <RankDistributions cands={cands} />

      <div style={{ height: "8%" }}></div>

      <WeightedTransfers cands={cands} />

      <div style={{ height: "8%" }}></div>

      <LaterChoices cands={cands} />
    </div>
  );
}

export default App;
