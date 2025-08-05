use std::{collections::HashMap, error::Error};

use crate::core::{Node, NodeInternal, writeable_file};

fn hmap_to_vec(k: String, n: &NodeInternal) -> Node {
    match n {
        NodeInternal::Value(v) => Node {
            name: k,
            value: Some(*v),
            children: None,
        },
        NodeInternal::Children(c) => {
            let x: Vec<Node> = c.iter().map(|(k, n)| hmap_to_vec(k.clone(), n)).collect();
            Node {
                name: k,
                value: None,
                children: Some(x),
            }
        }
    }
}

pub fn compute_hierarchy(all_ballots: &[[Option<&str>; 5]]) -> Result<(), Box<dyn Error>> {
    println!("Writing hierarchy data");

    let mut children: HashMap<String, NodeInternal> = HashMap::new();
    for ballot in all_ballots {
        // flatten to ignore Nones
        let flattened: Vec<_> = ballot.iter().flatten().collect();
        if flattened.is_empty() {
            continue;
        }

        let mut hmap = &mut children;

        for choice in flattened {
            let key = choice.to_string();
            if !hmap.contains_key(&key) {
                let hm = HashMap::new();
                hmap.insert(key.clone(), NodeInternal::Children(hm));
            }
            let Some(NodeInternal::Children(h)) = hmap.get_mut(&key) else {
                unreachable!();
            };
            hmap = h;
        }

        // add exhausted node to hmap with NodeInternal::Value
        let key = "Exhausted".to_string();
        hmap.entry(key)
            .and_modify(|node| {
                let NodeInternal::Value(v) = node else {
                    // exhausted can never have children
                    unreachable!()
                };
                *v += 1;
            })
            .or_insert(NodeInternal::Value(1));
    }

    let children_vec: Vec<Node> = children
        .into_iter()
        .map(|(k, n)| hmap_to_vec(k, &n))
        .collect();

    let tree = Node {
        name: "Root".to_owned(),
        value: children_vec.iter().map(|node| node.value).sum(),
        children: Some(children_vec),
    };
    let mut f = writeable_file("./out/tree.json")?;
    serde_json::to_writer(&mut f, &tree)?;
    Ok(())
}
