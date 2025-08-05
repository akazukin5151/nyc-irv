use std::{collections::HashMap, error::Error, fs, io::Write, path::PathBuf};

use crate::core::writeable_file;

pub fn compute_later_choices(
    all_ballots: &[[Option<&str>; 5]],
    cands_to_n_wins: &[(&&str, &i32)],
) -> Result<(), Box<dyn Error>> {
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
                let prev_choice = prev_choice.split(' ').next_back().unwrap();

                let next_choice = if i == ballot.len() {
                    "Exhausted"
                } else {
                    ballot[i].split(' ').next_back().unwrap()
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
