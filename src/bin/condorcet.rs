use std::{
    collections::HashMap,
    error::Error,
    fs::{self, File},
    io::{Read, Write},
    path::{Path, PathBuf},
    time::Instant,
};

use rayon::prelude::{IntoParallelRefIterator, ParallelIterator};

fn writeable_file<P: AsRef<Path>>(path: P) -> Result<File, std::io::Error> {
    File::options()
        .write(true)
        .create(true)
        .truncate(true)
        .open(path)
}

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
            ballot.map(|v| {
                if v == 0 {
                    None
                } else {
                    Some(sorted_cands[v as usize - 1])
                }
            })
        })
        .collect();

    println!("Compute pairwise matrix");

    // key = (cand1, cand2)
    // value = number of voters preferring cand1 over cand2
    let mut matrix: HashMap<_, u32> = HashMap::new();
    for cand1 in sorted_cands.iter() {
        for cand2 in sorted_cands.iter() {
            let pair = (*cand1, *cand2);

            let v = all_ballots
                .par_iter()
                .map(|ballot| {
                    let o_cand1_pos = ballot.iter().flatten().position(|cand| cand == cand1);
                    let o_cand2_pos = ballot.iter().flatten().position(|cand| cand == cand2);

                    // if cand1 is preferred, add `1`. otherwise, no need to add and skip.
                    // if a candidate has not been ranked, the other candidate is preferred.
                    // if both candidate is not ranked, skip this voter.
                    match (o_cand1_pos, o_cand2_pos) {
                        (Some(_), None) => 1,
                        (Some(cand1_pos), Some(cand2_pos)) => {
                            if cand1_pos < cand2_pos {
                                1
                            } else {
                                0
                            }
                        }
                        _ => 0,
                    }
                })
                .sum();

            matrix.entry(pair).and_modify(|c| *c += v).or_insert(v);
        }
    }

    eprintln!("Looking for Condorcet winner\n");

    let mut cands_to_n_wins = HashMap::new();
    for cand in sorted_cands.iter() {
        cands_to_n_wins.insert(*cand, 0);
    }

    let mut winner_found = false;
    for this_cand in sorted_cands.iter() {
        let mut is_cand_possible_cw = true;
        for other_cand in sorted_cands.iter().filter(|c| *c != this_cand) {
            let pair1 = (*this_cand, *other_cand);
            let pair2 = (*other_cand, *this_cand);

            // get the number of voters that prefers one candidate over the other
            let n_prefer_this_cand = matrix.get(&pair1).ok_or("matrix has no {pair1}")?;
            let n_prefer_other_cand = matrix.get(&pair2).ok_or("matrix has no {pair2}")?;
            if n_prefer_other_cand > n_prefer_this_cand {
                is_cand_possible_cw = false;
            } else {
                *cands_to_n_wins.get_mut(*this_cand).unwrap() += 1;
            }
        }

        if is_cand_possible_cw {
            println!("{this_cand} is the Condorcet winner");
            winner_found = true;
        }
    }

    if !winner_found {
        println!("No Condorcet winner found, there is a Condorcet cycle");
    }

    println!();

    let mut cands_to_n_wins: Vec<(_, _)> = cands_to_n_wins.iter().collect();
    cands_to_n_wins.sort_by_key(|x| x.1);
    let cands_to_n_wins: Vec<_> = cands_to_n_wins.into_iter().rev().collect();

    let mut f = writeable_file("./out/sorted_cands.tsv")?;

    for (cand, _) in &cands_to_n_wins {
        f.write_all(cand.as_bytes())?;
        f.write_all(b"\t")?;
    }

    println!("Candidate | Number of pairwise wins");
    println!("--- | ---");
    for (cand, n_wins) in &cands_to_n_wins {
        println!("{cand} | {n_wins}");
    }

    println!(
        "\nCandidate A | Result | Candidate B | Votes for A | Votes for B | % for A | % for B"
    );
    println!("--- | --- | --- | --- | --- | --- | ---");
    for (this_cand, _) in &cands_to_n_wins {
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
                println!("{this_cand} | loses to ❌ | {other_cand} | {n_prefer_this_cand} | {n_prefer_other_cand} | {this_perc:.2}% | {other_perc:.2}%");
            } else {
                println!("{this_cand} | beats ✅ | {other_cand} | {n_prefer_this_cand} | {n_prefer_other_cand} | {this_perc:.2}% | {other_perc:.2}%");
            }
        }
    }

    let mut buf = String::new();
    buf.push_str("| | ");
    for cand in &sorted_cands {
        buf.push_str(cand);
        buf.push_str(" | ");
    }
    buf.push_str("\n| --- | ");
    for _ in &sorted_cands {
        buf.push_str("--- | ");
    }

    println!("\n{buf}");
    drop(buf);

    for this_cand in sorted_cands.iter() {
        print!("{this_cand} | ");
        for other_cand in sorted_cands.iter() {
            if *other_cand == *this_cand {
                print!("| ");
                continue;
            }
            let n_prefer_this_cand = matrix.get(&(this_cand, other_cand)).unwrap();
            print!("{n_prefer_this_cand} | ");
        }
        println!();
    }

    println!("Writing distribution of ranks");

    let path = PathBuf::from("./out/rank-distributions.tsv");
    let mut f = writeable_file(path)?;
    f.write_all(b"cand\trank\tfreq\n")?;

    for (cand_idx, (cand, _)) in cands_to_n_wins.iter().enumerate() {
        let mut position_freqs = [0; 6];
        for ballot in &all_ballots {
            let pos = ballot
                .iter()
                .position(|choice| choice.map_or(false, |c| c == **cand));
            match pos {
                Some(p) => position_freqs[p] += 1,
                None => position_freqs[5] += 1,
            }
        }

        for (idx, freq) in position_freqs.iter().enumerate() {
            f.write_all(format!("{cand_idx}\t{}\t{freq}\n", idx + 1).as_bytes())?;
        }
    }

    println!("Writing later choices data");

    let mut all_n_voters = vec![];
    let mut matrices = [vec![], vec![], vec![], vec![], vec![]];
    for (idx, (first_choice_cand, _)) in cands_to_n_wins.iter().enumerate() {
        let later_choices: Vec<Vec<&str>> = all_ballots
            .iter()
            .filter(|ballot| ballot.iter().flatten().next() == Some(first_choice_cand))
            .map(|ballot| {
                ballot
                    .iter()
                    .flatten()
                    .filter(|c| c != first_choice_cand)
                    .copied()
                    .collect()
            })
            .collect();

        let mut cand_rank_freqs: Vec<[i64; 4]> = vec![];
        let mut matrix_row = vec![];
        for (other_cand, _) in cands_to_n_wins.iter() {
            if other_cand == first_choice_cand {
                matrix_row.push([0.; 5]);
                continue;
            }

            // for voters that ranked first_choice_cand first, find the position they ranked other_cand
            let ranks = later_choices
                .iter()
                .map(|ballot| ballot.iter().position(|c| c == *other_cand));

            let mut freqs = [0; 4];
            for rank in ranks.flatten() {
                freqs[rank] += 1;
            }

            cand_rank_freqs.push(freqs);

            matrix_row.push(calc_scores(&freqs));
        }

        // treat exhausted as if it's a separate candidate and count
        // the frequencies of ranks where ballots become exhausted
        let mut exhausted_freqs = [0; 4];
        for ballot in &later_choices {
            for (idx, c) in exhausted_freqs.iter_mut().enumerate() {
                if ballot.len() <= idx {
                    *c += 1;
                }
            }
        }
        cand_rank_freqs.push(exhausted_freqs);
        matrix_row.push(calc_scores(&exhausted_freqs));

        let mut path = PathBuf::from("./out/later_choices");
        let _ = fs::create_dir_all(&path);
        path.push(format!("{idx}.json"));

        let mut f = writeable_file(path)?;
        serde_json::to_writer(&mut f, &cand_rank_freqs)?;

        for (idx, matrix) in matrices.iter_mut().enumerate() {
            let r: Vec<f32> = matrix_row.iter().map(|v| v[idx]).collect();
            matrix.push(r);
        }

        let n_voters = later_choices.len();
        all_n_voters.push(n_voters);

        let mut flows: HashMap<String, HashMap<String, i64>> = HashMap::new();

        for ballot in later_choices {
            let mut i = 0;
            // iterate up to ballot.len() + 1 to count exhausted ballots
            while i < ballot.len() + 1 {
                // we don't need to count "6. Exhausted"
                // because by count 5, all preferences have been indicated.
                // so the next count will be "none".
                // i + 2 is the number for the `to` field
                if i + 2 == 6 {
                    break;
                }

                let prev_choice = if i == 0 {
                    first_choice_cand
                } else {
                    ballot[i - 1]
                };

                let next_choice = if i == ballot.len() {
                    "Exhausted"
                } else {
                    ballot[i]
                };

                let from = format!("{}: {prev_choice}", i + 1);
                let to = format!("{}: {next_choice}", i + 2);

                flows
                    .entry(from)
                    .and_modify(|hmap| {
                        hmap.entry(to.clone()).and_modify(|c| *c += 1).or_insert(1);
                    })
                    .or_insert_with(|| {
                        let mut hmap = HashMap::new();
                        hmap.insert(to, 1_i64);
                        hmap
                    });

                i += 1;
            }
        }

        let mut path = PathBuf::from("./out/flows");
        let _ = fs::create_dir_all(&path);
        path.push(format!("{idx}.json"));

        let mut f = writeable_file(path)?;
        serde_json::to_writer(&mut f, &flows)?;
    }

    let mut f = writeable_file("./out/n_voters.tsv")?;

    for n_voters in all_n_voters {
        f.write_all(n_voters.to_string().as_bytes())?;
        f.write_all(b"\t")?;
    }

    println!("Writing pairwise graph data");
    for matrix in matrices.iter_mut() {
        matrix.push(vec![0.0; cands_to_n_wins.len() + 1]);
    }

    let mut f = writeable_file("./out/matrices.json")?;
    serde_json::to_writer(&mut f, &matrices)?;

    Ok(())
}

fn calc_scores(rank_freqs: &[i64]) -> [f32; 5] {
    let mut first_transfer_score = 0;
    let mut borda_score = 0;
    let mut harmonic_score = 0.;
    let mut geometric_score = 0.;
    let mut inv_sq_score = 0.;

    for (idx, freq) in rank_freqs.iter().enumerate() {
        // "first transfer score" is about counting only the first transfer from first
        // to second preference. all other transfers have score 0.
        if idx == 0 {
            first_transfer_score += freq;
        }

        // if idx == 0, +4
        // if idx == 1, +3
        // if idx == 2, +2
        borda_score += freq * (4 - idx as i64);

        let f = *freq as f32;

        // nauru (harmonic) = 1/1, 1/2, 1/3, 1/4
        harmonic_score += f * (1. / (idx as f32 + 1.));

        // geometric = 1/1, 1/2, 1/4, 1/8
        geometric_score += f * (1. / (2_i32.pow(idx as u32) as f32));

        // inverse square = 1/1^2, 1/2^2, 1/3^2, 1/4^2
        inv_sq_score += f * (1. / ((idx + 1).pow(2) as f32));
    }

    [
        first_transfer_score as f32,
        borda_score as f32,
        harmonic_score,
        geometric_score,
        inv_sq_score,
    ]
}
