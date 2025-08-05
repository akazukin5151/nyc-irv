use std::{collections::HashMap, fs::File, path::Path};

use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct Node {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<Node>>,
}

pub enum NodeInternal {
    /// Leaf node
    Value(i64),
    /// Edge
    Children(HashMap<String, NodeInternal>),
}

pub fn writeable_file<P: AsRef<Path>>(path: P) -> Result<File, std::io::Error> {
    File::options()
        .write(true)
        .create(true)
        .truncate(true)
        .open(path)
}
