use std::{
    collections::{HashMap, HashSet},
    error::Error,
    fs::File,
    io::Write,
    path::Path,
    time::Instant,
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
            bar.inc(1);
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
            first_prefs
                .entry(first_pref)
                .and_modify(|c| *c += 1)
                .or_insert(1);
        }
    }

    dbg!(&first_prefs);

    println!(
        "Found {} named candidates for mayor",
        mayoral_candidates.len()
    );

    let mut sorted_cands: Vec<_> = mayoral_candidates.iter().collect();
    sorted_cands
        .sort_unstable_by(|a, b| first_prefs.get(b).unwrap().cmp(first_prefs.get(a).unwrap()));

    let mut cands_file = File::options()
        .write(true)
        .create(true)
        .truncate(true)
        .open("./out/cands.csv")?;

    let mut buf = String::new();
    for cand in &sorted_cands {
        buf.push_str(cand);
        buf.push(',');
    }
    cands_file.write_all(buf.as_bytes())?;

    // convert strings to indices of the candidates (sorted by first preferences)
    // 0 means invalid/ignored candidate (undervote/overvote/write-in)
    // all other numbers means `index+1`
    let compact_ballots: Vec<[u8; 5]> = all_ballots
        .iter()
        .map(|ballot| {
            // very small array so perf problems with array.map is not applicable
            ballot.map(|choice| {
                choice.map_or_else(
                    || 0,
                    |cand| (sorted_cands.iter().position(|c| **c == cand).unwrap() as u8) + 1,
                )
            })
        })
        .collect();

    let t1 = Instant::now();
    let mut ballot_file = File::options()
        .write(true)
        .create(true)
        .truncate(true)
        .open("./out/ballots.bin")?;

    let buf: Vec<u8> = compact_ballots.iter().flatten().copied().collect();

    ballot_file.write_all(&buf)?;
    println!("Unpadded binary: {:?}", t1.elapsed());

    Ok(())
}
