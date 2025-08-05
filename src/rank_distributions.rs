use std::{io::Write, path::PathBuf};

use crate::core::writeable_file;

pub fn compute_rank_distributions(
    all_ballots: &[[Option<&str>; 5]],
    cands_to_n_wins: &[(&&str, &i32)],
) -> Result<(), Box<dyn std::error::Error>> {
    println!("Writing distribution of ranks");

    let path = PathBuf::from("./out/rank-distributions.tsv");
    let mut f = writeable_file(path)?;
    f.write_all(b"cand\trank\tfreq\n")?;

    for (cand_idx, (cand, _)) in cands_to_n_wins.iter().enumerate() {
        let mut position_freqs = [0; 6];
        for ballot in all_ballots {
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

    Ok(())
}
