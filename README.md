# 2025 New York City Democratic mayoral primary

Condorcet analysis of the 2025 New York City Democratic mayoral primary. It was done under IRV (RCV), which does not always elect the Condorcet winner.

## Caveats

* It doesn't handle write-ins - it would skip to the next named candidate (won't affect the result anyway, but it's good to write accurate code)
* It doesn't handle ties (no ties happened anyway, but it's good to write accurate code)
* It ignores overvotes. Don't know what to do with them, or what the regulations are. Undervotes are also ignored.
* You should probably use https://github.com/voting-tools/pref_voting. I'm reinventing the wheel here because it's fun and I like Rust, but that doesn't mean you should use this code.

## Run

Full CVR data from https://www.vote.nyc/page/election-results-summary

Download it and unzip all files into `./data`

Run:

```
cargo b --release
cargo r --release --bin parse
cargo r --release --bin condorcet
```

## Results

```
$ cargo r --release --bin parse
    Finished `release` profile [optimized] target(s) in 0.03s
     Running `target/release/parse`
Total 951 candidates in all elections
██████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 31/31
Found 1114433 ballots total
[src/bin/parse.rs:126:5] &first_prefs = {
    "Brad Lander": 121148,
    "Andrew M. Cuomo": 387664,
    "Zellnor Myrie": 10816,
    "Jessica Ramos": 4444,
    "Michael Blake": 4493,
    "Zohran Kwame Mamdani": 469960,
    "Scott M. Stringer": 18205,
    "Whitney R. Tilson": 8602,
    "Paperboy Love Prince": 1679,
    "Selma K. Bartholomew": 1615,
    "Adrienne E. Adams": 44705,
}
Found 11 named candidates for mayor
Unpadded binary: 6.964151ms

$ cargo r --release --bin condorcet
    Finished `release` profile [optimized] target(s) in 0.03s
     Running `target/release/condorcet`
Reading unpadded binary took 3.512777ms
Read 1114433 ballots
Read 11 candidates
Compute pairwise matrix
Looking for Condorcet winner
Zohran Kwame Mamdani is the Condorcet winner
Zohran Kwame Mamdani beats Andrew M. Cuomo by 573635 > 443762
Zohran Kwame Mamdani beats Brad Lander by 535859 > 234621
Zohran Kwame Mamdani beats Adrienne E. Adams by 582746 > 196728
Zohran Kwame Mamdani beats Scott M. Stringer by 605940 > 166337
Zohran Kwame Mamdani beats Zellnor Myrie by 615224 > 99434
Zohran Kwame Mamdani beats Whitney R. Tilson by 634868 > 73668
Zohran Kwame Mamdani beats Michael Blake by 629677 > 49744
Zohran Kwame Mamdani beats Jessica Ramos by 630861 > 58642
Zohran Kwame Mamdani beats Paperboy Love Prince by 638291 > 15927
Zohran Kwame Mamdani beats Selma K. Bartholomew by 636822 > 20586
Saving pairwise matrix
```

## Pairwise matrix

The `value` here is the number of voters that preferred candidate **A** over **B**

```
            | Candidate B
----------- | -----------
Candidate A | value
```

For the number of voters that preferred candidate B over A, look for:

```
            | Candidate A
----------- | -----------
Candidate B | value
```

|                      | Zohran Kwame Mamdani |   Andrew M. Cuomo |   Brad Lander |   Adrienne E. Adams |   Scott M. Stringer |   Zellnor Myrie |   Whitney R. Tilson |   Michael Blake |   Jessica Ramos |   Paperboy Love Prince |   Selma K. Bartholomew
|:---------------------|-------------:|-----------------------:|------------------:|--------------:|--------------------:|--------------------:|----------------:|--------------------:|----------------:|----------------:|-----------------------:|
| Zohran Kwame Mamdani |              |                 573635 |            535859 |        582746 |              605940 |              615224 |          634868 |              629677 |          630861 |          638291 |                 636822 |
| Andrew M. Cuomo      |       443762 |                        |            441760 |        451439 |              461461 |              474945 |          478916 |              483764 |          482636 |          488448 |                 486365 |
| Brad Lander          |       234621 |                 527418 |                   |        545138 |              578968 |              601410 |          618724 |              609053 |          615701 |          628846 |                 628094 |
| Adrienne E. Adams    |       196728 |                 457755 |            205384 |               |              506322 |              470926 |          564461 |              523248 |          558147 |          573839 |                 569245 |
| Scott M. Stringer    |       166337 |                 205837 |            141462 |        198164 |                     |              271899 |          308832 |              310799 |          312088 |          328159 |                 325313 |
| Zellnor Myrie        |        99434 |                 369199 |             98415 |        184369 |              356482 |                     |          414876 |              378000 |          411376 |          425323 |                 420203 |
| Whitney R. Tilson    |        73668 |                  45581 |             64697 |         74280 |               75909 |               85119 |                 |               94676 |           85301 |           97673 |                  93834 |
| Michael Blake        |        49744 |                 231199 |             65153 |        110878 |              239145 |              133980 |          262823 |                     |          252421 |          266401 |                 264026 |
| Jessica Ramos        |        58642 |                  99085 |             76932 |         92653 |              112377 |              119180 |          143295 |              140286 |                 |          149848 |                 143194 |
| Paperboy Love Prince |        15927 |                  45553 |             24365 |         36537 |               47366 |               43714 |           56089 |               51045 |           51720 |                 |                  56993 |
| Selma K. Bartholomew |        20586 |                  42196 |             39792 |         41491 |               45194 |               53501 |           58270 |               55465 |           49128 |           59946 |                        |

The rows are sorted with the first preferences vote on top.

Looking at the first row with Zohran Kwame Mamdani, for every other candidate, more voters preferred him over the other. Therefore he is the Condorcet winner.

