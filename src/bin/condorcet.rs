use std::{collections::HashMap, error::Error, fs::File, io::Read, time::Instant};

use rayon::prelude::{IntoParallelRefIterator, ParallelIterator};

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

    for (cand, _) in cands_to_n_wins.iter() {
        println!("\nDistribution of ranks for {cand}");
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

        let sum: i32 = position_freqs.iter().sum();
        let sum = sum as f64;
        for (idx, freq) in position_freqs.iter().enumerate() {
            let perc = *freq as f64 / sum * 100.;
            if idx == 5 {
                println!("Unranked: {freq} ({:.02}%)", perc);
            } else {
                println!("Rank {}: {freq} ({:.02}%)", idx + 1, perc);
            }
        }
    }

    Ok(())
}
