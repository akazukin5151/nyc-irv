use std::{
    collections::{HashMap, HashSet},
    error::Error,
    fs::File,
    io::{Read, Write},
    time::Instant,
};

use nyc_irv::{
    condorcet::{compute_pairwise_matrix, look_for_condorcet_winner},
    core::writeable_file,
    hierarchy::compute_hierarchy,
    later_choices::compute_later_choices,
    rank_distributions::compute_rank_distributions,
};

fn main() -> Result<(), Box<dyn Error>> {
    let mut ballot_file = File::open("./out/ballots.bin")?;
    let mut buf = vec![];
    ballot_file.read_to_end(&mut buf)?;

    let t1 = Instant::now();
    let chunked = buf.chunks_exact(5);
    assert_eq!(chunked.remainder().len(), 0);
    let ballots: Vec<[_; 5]> = chunked
        .map(|ballot| {
            let array: [u8; 5] = ballot.try_into().unwrap();
            array
        })
        .collect();

    println!("Reading unpadded binary took {:?}", t1.elapsed());
    println!("Read {} ballots", ballots.len());

    let mut cands_file = File::open("./out/cands.csv")?;
    let mut buf = vec![];
    cands_file.read_to_end(&mut buf)?;
    let csv = String::from_utf8(buf)?;
    let mut sorted_cands: Vec<&str> = csv.split(',').collect();
    // ignore trailing comma
    if sorted_cands.last().unwrap().is_empty() {
        sorted_cands.pop();
    }
    let sorted_cands = sorted_cands;

    println!("Read {} candidates", sorted_cands.len());

    let all_ballots: Vec<[Option<&str>; 5]> = ballots
        .iter()
        .map(|ballot| {
            let mut seen = HashSet::new();
            let mut res: [Option<&str>; 5] = [const { None }; 5];
            let mut idx = 0;
            for num in ballot {
                if *num == 0 {
                    res[idx] = None;
                    idx += 1;
                } else {
                    let name = sorted_cands[*num as usize - 1];
                    if !seen.contains(name) {
                        seen.insert(name);
                        res[idx] = Some(name);
                        idx += 1;
                    }
                    // if already inserted, do not increment idx.
                    // the next non-0 num will be written to the current idx,
                    // leaving at least 1 None at the end.
                    // as we want to shift choices so that all Nones are at the end.
                }
            }
            res
        })
        .collect();

    let matrix = compute_pairwise_matrix(&sorted_cands, &all_ballots);

    let cands_to_n_wins = look_for_condorcet_winner(&sorted_cands, &matrix)?;

    println!();

    let mut cands_to_n_wins: Vec<(_, _)> = cands_to_n_wins.iter().collect();
    cands_to_n_wins.sort_by_key(|x| x.1);
    let cands_to_n_wins: Vec<_> = cands_to_n_wins.into_iter().rev().collect();

    let mut f = writeable_file("./out/sorted_cands.tsv")?;

    for (cand, _) in &cands_to_n_wins {
        f.write_all(cand.as_bytes())?;
        f.write_all(b"\t")?;
    }

    print_n_wins(&cands_to_n_wins);
    compute_pairwise_matchups(&sorted_cands, &matrix, &cands_to_n_wins)?;

    compute_rank_distributions(&all_ballots, &cands_to_n_wins)?;
    compute_later_choices(&all_ballots, &cands_to_n_wins)?;
    compute_hierarchy(&all_ballots)?;

    Ok(())
}

fn print_n_wins(cands_to_n_wins: &[(&&str, &i32)]) {
    println!("Candidate | Number of pairwise wins");
    println!("--- | ---");
    for (cand, n_wins) in cands_to_n_wins {
        println!("{cand} | {n_wins}");
    }
}

fn compute_pairwise_matchups(
    sorted_cands: &[&str],
    matrix: &HashMap<(&str, &str), u32>,
    cands_to_n_wins: &[(&&str, &i32)],
) -> Result<(), Box<dyn Error>> {
    println!(
        "\nCandidate A | Result | Candidate B | Votes for A | Votes for B | % for A | % for B"
    );
    println!("--- | --- | --- | --- | --- | --- | ---");
    let mut rows = vec![];
    for (this_cand, _) in cands_to_n_wins {
        let this_cand = *this_cand;
        for other_cand in sorted_cands.iter().filter(|c| *c != this_cand) {
            let pair1 = (*this_cand, *other_cand);
            let pair2 = (*other_cand, *this_cand);

            // get the number of voters that prefers one candidate over the other
            let n_prefer_this_cand = matrix.get(&pair1).ok_or("matrix has no {pair1}")?;
            let n_prefer_other_cand = matrix.get(&pair2).ok_or("matrix has no {pair2}")?;

            let sum = (n_prefer_this_cand + n_prefer_other_cand) as f32;
            let this_perc = *n_prefer_this_cand as f32 / sum * 100.;
            let other_perc = *n_prefer_other_cand as f32 / sum * 100.;

            if n_prefer_other_cand > n_prefer_this_cand {
                println!(
                    "{this_cand} | loses to ❌ | {other_cand} | {n_prefer_this_cand} | {n_prefer_other_cand} | {this_perc:.2}% | {other_perc:.2}%"
                );
            } else {
                println!(
                    "{this_cand} | beats ✅ | {other_cand} | {n_prefer_this_cand} | {n_prefer_other_cand} | {this_perc:.2}% | {other_perc:.2}%"
                );
            }

            rows.push((
                this_cand,
                other_cand,
                n_prefer_this_cand,
                n_prefer_other_cand,
            ));
        }
    }

    let mut f = writeable_file("./out/matchups.json")?;
    serde_json::to_writer(&mut f, &rows)?;

    Ok(())
}

