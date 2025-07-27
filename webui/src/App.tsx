import { useEffect, useState } from "react";
import { FirstChoiceAnalysis } from "./FirstChoiceAnalysis";

function App() {
  const [cands, setCands] = useState<Array<string>>([]);
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

  return (
    <div className="h-screen p-2">
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
