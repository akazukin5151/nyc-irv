use std::{collections::HashMap, error::Error};

use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

pub fn look_for_condorcet_winner<'a>(
    sorted_cands: &[&'a str],
    matrix: &HashMap<(&str, &str), u32>,
) -> Result<HashMap<&'a str, i32>, Box<dyn Error>> {
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
    Ok(cands_to_n_wins)
}

pub fn compute_pairwise_matrix<'a>(
    sorted_cands: &[&'a str],
    all_ballots: &[[Option<&str>; 5]],
) -> HashMap<(&'a str, &'a str), u32> {
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

    matrix
}
