import { useEffect, useState } from "react";
import { LaterChoices } from "./LaterChoices";
import { RankDistributions } from "./RankDistributions";
import { handleCandidateSelectCore } from "./core";
import { WeightedTransfers } from "./WeightedTransfers";
import { ExternalLink } from "./ExternalLink";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
  const [allNVotes, setAllNVotes] = useState<Array<number>>([]);
  const [laterChoices, setLaterChoices] = useState<Array<Array<number>>>([]);
  const [flowData, setFlowData] = useState<
    Record<string, Record<string, number>>
  >({});
  const [rankDistData, setRankDistData] = useState<Array<Array<number>>>([]);
  const [allChordData, setAllChordData] = useState<Array<Array<Array<number>>>>(
    [],
  );

  useEffect(() => {
    const fn = async () => {
      fetch("sorted_cands.tsv")
        .then((x) => x.text())
        .then((cands_csv) => {
          const cands = cands_csv.split("\t").filter((cand) => cand !== "");
          setCands(cands);
          handleCandidateSelectCore(0, setLaterChoices, setFlowData);

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

      fetch("n_voters.tsv")
        .then((x) => x.text())
        .then((n_votes_tsv) => {
          const n_votes = n_votes_tsv.split("\t").map((s) => parseInt(s));
          setAllNVotes(n_votes);
        });

      fetch("matrices.json")
        .then((x) => x.json())
        .then((matrices) => setAllChordData(matrices));
    };

    fn();
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

      <RankDistributions cands={cands} rankDistData={rankDistData} />

      <div style={{ height: "8%" }}></div>

      <WeightedTransfers cands={cands} allChordData={allChordData} />

      <div style={{ height: "8%" }}></div>

      <LaterChoices
        cands={cands}
        allNVotes={allNVotes}
        laterChoices={laterChoices}
        setLaterChoices={setLaterChoices}
        flowData={flowData}
        setFlowData={setFlowData}
      />
    </div>
  );
}

export default App;
