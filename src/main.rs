use std::{
    collections::{HashMap, HashSet},
    error::Error,
    fs::{self, File},
    io::Write,
    path::Path,
};

use calamine::{open_workbook, Data, RangeDeserializerBuilder, Reader, Xlsx};
use indicatif::{ProgressBar, ProgressStyle};
use rayon::prelude::*;

fn main() -> Result<(), Box<dyn Error>> {
    let candidates_excel_name = "Primary Election 2025 - 06-24-2025_CandidacyID_To_Name.xlsx";
    let mut workbook: Xlsx<_> = open_workbook(format!("./data/{candidates_excel_name}"))?;

    let range = workbook.worksheet_range("Sheet1")?;

    let iter = RangeDeserializerBuilder::new().from_range(&range)?;

    // candidate ID -> candidate name
    let mut candidates: HashMap<String, String> = HashMap::new();
    for row in iter {
        let (num, name) = row?;
        candidates.insert(num, name);
    }

    eprintln!("Total {} candidates in all elections", candidates.len());

    let mut excels = vec![];
    for file in Path::new("./data").read_dir()? {
        let file = file?;
        let path = file.path();
        if let Some(name) = path.file_name() {
            if name == candidates_excel_name {
                continue;
            }
        }
        if let Some(ext) = path.extension() {
            if ext == "xlsx" {
                excels.push(
                    path.to_str()
                        .ok_or("Cannot convert Path to string")?
                        .to_owned(),
                )
            }
        }
    }

    // let subset = &excels[3..4];
    let subset = &excels[..];
    let bar = ProgressBar::new(subset.len() as u64).with_style(ProgressStyle::with_template(
        "{wide_bar} {pos}/{len} {msg}",
    )?);

    let all_ballots: Vec<_> = subset
        .par_iter()
        .flat_map(|path| {
            bar.inc(1);
            bar.set_message(format!("reading {path:?}"));

            let mut workbook: Xlsx<_> = open_workbook(path).unwrap();
            let range = workbook.worksheet_range("Sheet1").unwrap();
            let mut rows = range.rows();

            let header = rows.next().unwrap();
            let h = "DEM Mayor Choice 1 of 5 Citywide (026916)";
            let mayor_pos = header
                .iter()
                .map(|x| x.to_string())
                .position(|s| s == h)
                .expect("Mayor col not found");

            let mut ballots = vec![];
            for row in rows {
                // NYC allows ranking only 5 choices
                let mut this_voters_ballot: [Option<&str>; 5] = [const { None }; 5];
                for (offset, choice) in this_voters_ballot.iter_mut().enumerate() {
                    let idx = mayor_pos + offset;
                    let cell = &row[idx];
                    if let Data::String(value) = cell {
                        let candidate = match value.as_ref() {
                            "overvote" => None,
                            "undervote" => None,
                            // since none of the write-ins were important, we'll ignore them
                            "Write-in" => None,
                            _ => match candidates.get(value) {
                                Some(x) => Some(x.as_ref()),
                                None => {
                                    dbg!(value);
                                    None
                                }
                            },
                        };
                        *choice = candidate;
                    } else {
                        dbg!(cell);
                    }
                }
                ballots.push(this_voters_ballot);
            }
            ballots
        })
        .collect();

    bar.finish();

    println!("Found {} ballots total", all_ballots.len());

    let mut mayoral_candidates = HashSet::new();
    let mut first_prefs = HashMap::new();
    for ballot in all_ballots.iter() {
        // flatten removes the Nones, then we get the first candidate
        if let Some(first_pref) = ballot.iter().flatten().next() {
            mayoral_candidates.insert(*first_pref);
            first_prefs.entry(first_pref).and_modify(|c| *c += 1).or_insert(1);
        }
    }

    dbg!(&first_prefs);

    println!(
        "Found {} named candidates for mayor",
        mayoral_candidates.len()
    );

    // compute pairwise matrix
    // TODO(perf): parallelize this part
    // key = (cand1, cand2)
    // value = number of voters preferring cand1 over cand2
    let mut matrix: HashMap<_, u32> = HashMap::new();
    for cand1 in mayoral_candidates.iter() {
        for cand2 in mayoral_candidates.iter() {
            let pair = (*cand1, *cand2);

            // in all ballots, count how many voters ranked cand1 over cand2
            // (ignoring any Nones)
            for ballot in all_ballots.iter() {
                let o_cand1_pos = ballot.iter().flatten().position(|cand| cand == cand1);
                let o_cand2_pos = ballot.iter().flatten().position(|cand| cand == cand2);

                // if cand1 is preferred, add `1`. otherwise, add `0`.
                // if candidate has not been ranked, the other candidate is preferred.
                // if both candidate is not ranked, skip this voter.
                let v = match (o_cand1_pos, o_cand2_pos) {
                    (None, None) => continue,
                    (None, Some(_)) => 0,
                    (Some(_), None) => 1,
                    (Some(cand1_pos), Some(cand2_pos)) => {
                        if cand1_pos < cand2_pos {
                            1
                        } else {
                            0
                        }
                    }
                };

                matrix
                    .entry(pair)
                    .and_modify(|count| *count += v)
                    .or_insert(v);
            }
        }
    }

    eprintln!("Looking for Condorcet winner");
    let mut sorted_cands: Vec<_> = mayoral_candidates.into_iter().collect();
    sorted_cands
        .sort_unstable_by(|a, b| first_prefs.get(b).unwrap().cmp(first_prefs.get(a).unwrap()));

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
            }
        }

        if is_cand_possible_cw {
            println!("{this_cand} is the Condorcet winner");
            winner_found = true;

            for other_cand in sorted_cands.iter().filter(|c| *c != this_cand) {
                let pair1 = (*this_cand, *other_cand);
                let pair2 = (*other_cand, *this_cand);

                let n_prefer_this_cand = matrix.get(&pair1).ok_or("matrix has no {pair1}")?;
                let n_prefer_other_cand = matrix.get(&pair2).ok_or("matrix has no {pair2}")?;
                println!("{this_cand} beats {other_cand} by {n_prefer_this_cand} > {n_prefer_other_cand}");
            }

            break;
        }
    }

    if !winner_found {
        println!("No Condorcet winner found, there is a Condorcet cycle");
    }

    eprintln!("Saving pairwise matrix");

    let mut buf = String::new();
    buf.push_str(&format!(",{}\n", sorted_cands.join(",")));
    for this_cand in sorted_cands.iter() {
        buf.push_str(&format!("{this_cand},"));
        for other_cand in sorted_cands.iter() {
            if *other_cand == *this_cand {
                buf.push(',');
                continue;
            }
            let n_prefer_this_cand = matrix.get(&(this_cand, other_cand)).unwrap();
            buf.push_str(&format!("{n_prefer_this_cand},"));
        }
        buf.push('\n');
    }

    let _ = fs::create_dir_all("./out");

    let mut f = File::options()
        .write(true)
        .create(true)
        .truncate(true)
        .open("./out/matrix.csv")?;

    f.write_all(buf.as_bytes())?;

    Ok(())
}
