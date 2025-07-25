# 2025 New York City Democratic mayoral primary

Condorcet analysis of the 2025 New York City Democratic mayoral primary. It was done under IRV (RCV), which does not always elect the Condorcet winner.

## Caveats

* It ignores write-ins and skips to the next named candidate (won't affect the result anyway, but it's good to write accurate code)
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
Zohran Kwame Mamdani is the Condorcet winner

# <snipped markdown output; rendered below>

Saving pairwise matrix
```

### Number of pairwise wins

Candidate | Number of pairwise wins
--- | ---
Zohran Kwame Mamdani | 10
Brad Lander | 9
Adrienne E. Adams | 8
Andrew M. Cuomo | 7
Zellnor Myrie | 6
Scott M. Stringer | 5
Michael Blake | 4
Jessica Ramos | 3
Whitney R. Tilson | 2
Selma K. Bartholomew | 1
Paperboy Love Prince | 0

### Pairwise matchups

Candidate A | Result | Candidate B | Votes for A | Votes for B | % for A | % for B
--- | --- | --- | --- | --- | --- | ---
Zohran Kwame Mamdani | beats ✅ | Andrew M. Cuomo | 573635 | 443762 | 56.38% | 43.62%
Zohran Kwame Mamdani | beats ✅ | Brad Lander | 535859 | 234621 | 69.55% | 30.45%
Zohran Kwame Mamdani | beats ✅ | Adrienne E. Adams | 582746 | 196728 | 74.76% | 25.24%
Zohran Kwame Mamdani | beats ✅ | Scott M. Stringer | 605940 | 166337 | 78.46% | 21.54%
Zohran Kwame Mamdani | beats ✅ | Zellnor Myrie | 615224 | 99434 | 86.09% | 13.91%
Zohran Kwame Mamdani | beats ✅ | Whitney R. Tilson | 634868 | 73668 | 89.60% | 10.40%
Zohran Kwame Mamdani | beats ✅ | Michael Blake | 629677 | 49744 | 92.68% | 7.32%
Zohran Kwame Mamdani | beats ✅ | Jessica Ramos | 630861 | 58642 | 91.50% | 8.50%
Zohran Kwame Mamdani | beats ✅ | Paperboy Love Prince | 638291 | 15927 | 97.57% | 2.43%
Zohran Kwame Mamdani | beats ✅ | Selma K. Bartholomew | 636822 | 20586 | 96.87% | 3.13%
Brad Lander | loses to ❌ | Zohran Kwame Mamdani | 234621 | 535859 | 30.45% | 69.55%
Brad Lander | beats ✅ | Andrew M. Cuomo | 527418 | 441760 | 54.42% | 45.58%
Brad Lander | beats ✅ | Adrienne E. Adams | 545138 | 205384 | 72.63% | 27.37%
Brad Lander | beats ✅ | Scott M. Stringer | 578968 | 141462 | 80.36% | 19.64%
Brad Lander | beats ✅ | Zellnor Myrie | 601410 | 98415 | 85.94% | 14.06%
Brad Lander | beats ✅ | Whitney R. Tilson | 618724 | 64697 | 90.53% | 9.47%
Brad Lander | beats ✅ | Michael Blake | 609053 | 65153 | 90.34% | 9.66%
Brad Lander | beats ✅ | Jessica Ramos | 615701 | 76932 | 88.89% | 11.11%
Brad Lander | beats ✅ | Paperboy Love Prince | 628846 | 24365 | 96.27% | 3.73%
Brad Lander | beats ✅ | Selma K. Bartholomew | 628094 | 39792 | 94.04% | 5.96%
Adrienne E. Adams | loses to ❌ | Zohran Kwame Mamdani | 196728 | 582746 | 25.24% | 74.76%
Adrienne E. Adams | beats ✅ | Andrew M. Cuomo | 457755 | 451439 | 50.35% | 49.65%
Adrienne E. Adams | loses to ❌ | Brad Lander | 205384 | 545138 | 27.37% | 72.63%
Adrienne E. Adams | beats ✅ | Scott M. Stringer | 506322 | 198164 | 71.87% | 28.13%
Adrienne E. Adams | beats ✅ | Zellnor Myrie | 470926 | 184369 | 71.86% | 28.14%
Adrienne E. Adams | beats ✅ | Whitney R. Tilson | 564461 | 74280 | 88.37% | 11.63%
Adrienne E. Adams | beats ✅ | Michael Blake | 523248 | 110878 | 82.51% | 17.49%
Adrienne E. Adams | beats ✅ | Jessica Ramos | 558147 | 92653 | 85.76% | 14.24%
Adrienne E. Adams | beats ✅ | Paperboy Love Prince | 573839 | 36537 | 94.01% | 5.99%
Adrienne E. Adams | beats ✅ | Selma K. Bartholomew | 569245 | 41491 | 93.21% | 6.79%
Andrew M. Cuomo | loses to ❌ | Zohran Kwame Mamdani | 443762 | 573635 | 43.62% | 56.38%
Andrew M. Cuomo | loses to ❌ | Brad Lander | 441760 | 527418 | 45.58% | 54.42%
Andrew M. Cuomo | loses to ❌ | Adrienne E. Adams | 451439 | 457755 | 49.65% | 50.35%
Andrew M. Cuomo | beats ✅ | Scott M. Stringer | 461461 | 205837 | 69.15% | 30.85%
Andrew M. Cuomo | beats ✅ | Zellnor Myrie | 474945 | 369199 | 56.26% | 43.74%
Andrew M. Cuomo | beats ✅ | Whitney R. Tilson | 478916 | 45581 | 91.31% | 8.69%
Andrew M. Cuomo | beats ✅ | Michael Blake | 483764 | 231199 | 67.66% | 32.34%
Andrew M. Cuomo | beats ✅ | Jessica Ramos | 482636 | 99085 | 82.97% | 17.03%
Andrew M. Cuomo | beats ✅ | Paperboy Love Prince | 488448 | 45553 | 91.47% | 8.53%
Andrew M. Cuomo | beats ✅ | Selma K. Bartholomew | 486365 | 42196 | 92.02% | 7.98%
Zellnor Myrie | loses to ❌ | Zohran Kwame Mamdani | 99434 | 615224 | 13.91% | 86.09%
Zellnor Myrie | loses to ❌ | Andrew M. Cuomo | 369199 | 474945 | 43.74% | 56.26%
Zellnor Myrie | loses to ❌ | Brad Lander | 98415 | 601410 | 14.06% | 85.94%
Zellnor Myrie | loses to ❌ | Adrienne E. Adams | 184369 | 470926 | 28.14% | 71.86%
Zellnor Myrie | beats ✅ | Scott M. Stringer | 356482 | 271899 | 56.73% | 43.27%
Zellnor Myrie | beats ✅ | Whitney R. Tilson | 414876 | 85119 | 82.98% | 17.02%
Zellnor Myrie | beats ✅ | Michael Blake | 378000 | 133980 | 73.83% | 26.17%
Zellnor Myrie | beats ✅ | Jessica Ramos | 411376 | 119180 | 77.54% | 22.46%
Zellnor Myrie | beats ✅ | Paperboy Love Prince | 425323 | 43714 | 90.68% | 9.32%
Zellnor Myrie | beats ✅ | Selma K. Bartholomew | 420203 | 53501 | 88.71% | 11.29%
Scott M. Stringer | loses to ❌ | Zohran Kwame Mamdani | 166337 | 605940 | 21.54% | 78.46%
Scott M. Stringer | loses to ❌ | Andrew M. Cuomo | 205837 | 461461 | 30.85% | 69.15%
Scott M. Stringer | loses to ❌ | Brad Lander | 141462 | 578968 | 19.64% | 80.36%
Scott M. Stringer | loses to ❌ | Adrienne E. Adams | 198164 | 506322 | 28.13% | 71.87%
Scott M. Stringer | loses to ❌ | Zellnor Myrie | 271899 | 356482 | 43.27% | 56.73%
Scott M. Stringer | beats ✅ | Whitney R. Tilson | 308832 | 75909 | 80.27% | 19.73%
Scott M. Stringer | beats ✅ | Michael Blake | 310799 | 239145 | 56.51% | 43.49%
Scott M. Stringer | beats ✅ | Jessica Ramos | 312088 | 112377 | 73.53% | 26.47%
Scott M. Stringer | beats ✅ | Paperboy Love Prince | 328159 | 47366 | 87.39% | 12.61%
Scott M. Stringer | beats ✅ | Selma K. Bartholomew | 325313 | 45194 | 87.80% | 12.20%
Michael Blake | loses to ❌ | Zohran Kwame Mamdani | 49744 | 629677 | 7.32% | 92.68%
Michael Blake | loses to ❌ | Andrew M. Cuomo | 231199 | 483764 | 32.34% | 67.66%
Michael Blake | loses to ❌ | Brad Lander | 65153 | 609053 | 9.66% | 90.34%
Michael Blake | loses to ❌ | Adrienne E. Adams | 110878 | 523248 | 17.49% | 82.51%
Michael Blake | loses to ❌ | Scott M. Stringer | 239145 | 310799 | 43.49% | 56.51%
Michael Blake | loses to ❌ | Zellnor Myrie | 133980 | 378000 | 26.17% | 73.83%
Michael Blake | beats ✅ | Whitney R. Tilson | 262823 | 94676 | 73.52% | 26.48%
Michael Blake | beats ✅ | Jessica Ramos | 252421 | 140286 | 64.28% | 35.72%
Michael Blake | beats ✅ | Paperboy Love Prince | 266401 | 51045 | 83.92% | 16.08%
Michael Blake | beats ✅ | Selma K. Bartholomew | 264026 | 55465 | 82.64% | 17.36%
Jessica Ramos | loses to ❌ | Zohran Kwame Mamdani | 58642 | 630861 | 8.50% | 91.50%
Jessica Ramos | loses to ❌ | Andrew M. Cuomo | 99085 | 482636 | 17.03% | 82.97%
Jessica Ramos | loses to ❌ | Brad Lander | 76932 | 615701 | 11.11% | 88.89%
Jessica Ramos | loses to ❌ | Adrienne E. Adams | 92653 | 558147 | 14.24% | 85.76%
Jessica Ramos | loses to ❌ | Scott M. Stringer | 112377 | 312088 | 26.47% | 73.53%
Jessica Ramos | loses to ❌ | Zellnor Myrie | 119180 | 411376 | 22.46% | 77.54%
Jessica Ramos | beats ✅ | Whitney R. Tilson | 143295 | 85301 | 62.68% | 37.32%
Jessica Ramos | loses to ❌ | Michael Blake | 140286 | 252421 | 35.72% | 64.28%
Jessica Ramos | beats ✅ | Paperboy Love Prince | 149848 | 51720 | 74.34% | 25.66%
Jessica Ramos | beats ✅ | Selma K. Bartholomew | 143194 | 49128 | 74.46% | 25.54%
Whitney R. Tilson | loses to ❌ | Zohran Kwame Mamdani | 73668 | 634868 | 10.40% | 89.60%
Whitney R. Tilson | loses to ❌ | Andrew M. Cuomo | 45581 | 478916 | 8.69% | 91.31%
Whitney R. Tilson | loses to ❌ | Brad Lander | 64697 | 618724 | 9.47% | 90.53%
Whitney R. Tilson | loses to ❌ | Adrienne E. Adams | 74280 | 564461 | 11.63% | 88.37%
Whitney R. Tilson | loses to ❌ | Scott M. Stringer | 75909 | 308832 | 19.73% | 80.27%
Whitney R. Tilson | loses to ❌ | Zellnor Myrie | 85119 | 414876 | 17.02% | 82.98%
Whitney R. Tilson | loses to ❌ | Michael Blake | 94676 | 262823 | 26.48% | 73.52%
Whitney R. Tilson | loses to ❌ | Jessica Ramos | 85301 | 143295 | 37.32% | 62.68%
Whitney R. Tilson | beats ✅ | Paperboy Love Prince | 97673 | 56089 | 63.52% | 36.48%
Whitney R. Tilson | beats ✅ | Selma K. Bartholomew | 93834 | 58270 | 61.69% | 38.31%
Selma K. Bartholomew | loses to ❌ | Zohran Kwame Mamdani | 20586 | 636822 | 3.13% | 96.87%
Selma K. Bartholomew | loses to ❌ | Andrew M. Cuomo | 42196 | 486365 | 7.98% | 92.02%
Selma K. Bartholomew | loses to ❌ | Brad Lander | 39792 | 628094 | 5.96% | 94.04%
Selma K. Bartholomew | loses to ❌ | Adrienne E. Adams | 41491 | 569245 | 6.79% | 93.21%
Selma K. Bartholomew | loses to ❌ | Scott M. Stringer | 45194 | 325313 | 12.20% | 87.80%
Selma K. Bartholomew | loses to ❌ | Zellnor Myrie | 53501 | 420203 | 11.29% | 88.71%
Selma K. Bartholomew | loses to ❌ | Whitney R. Tilson | 58270 | 93834 | 38.31% | 61.69%
Selma K. Bartholomew | loses to ❌ | Michael Blake | 55465 | 264026 | 17.36% | 82.64%
Selma K. Bartholomew | loses to ❌ | Jessica Ramos | 49128 | 143194 | 25.54% | 74.46%
Selma K. Bartholomew | beats ✅ | Paperboy Love Prince | 59946 | 56993 | 51.26% | 48.74%
Paperboy Love Prince | loses to ❌ | Zohran Kwame Mamdani | 15927 | 638291 | 2.43% | 97.57%
Paperboy Love Prince | loses to ❌ | Andrew M. Cuomo | 45553 | 488448 | 8.53% | 91.47%
Paperboy Love Prince | loses to ❌ | Brad Lander | 24365 | 628846 | 3.73% | 96.27%
Paperboy Love Prince | loses to ❌ | Adrienne E. Adams | 36537 | 573839 | 5.99% | 94.01%
Paperboy Love Prince | loses to ❌ | Scott M. Stringer | 47366 | 328159 | 12.61% | 87.39%
Paperboy Love Prince | loses to ❌ | Zellnor Myrie | 43714 | 425323 | 9.32% | 90.68%
Paperboy Love Prince | loses to ❌ | Whitney R. Tilson | 56089 | 97673 | 36.48% | 63.52%
Paperboy Love Prince | loses to ❌ | Michael Blake | 51045 | 266401 | 16.08% | 83.92%
Paperboy Love Prince | loses to ❌ | Jessica Ramos | 51720 | 149848 | 25.66% | 74.34%
Paperboy Love Prince | loses to ❌ | Selma K. Bartholomew | 56993 | 59946 | 48.74% | 51.26%

### Pairwise matrix

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

| | Zohran Kwame Mamdani | Andrew M. Cuomo | Brad Lander | Adrienne E. Adams | Scott M. Stringer | Zellnor Myrie | Whitney R. Tilson | Michael Blake | Jessica Ramos | Paperboy Love Prince | Selma K. Bartholomew |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
Zohran Kwame Mamdani | | 573635 | 535859 | 582746 | 605940 | 615224 | 634868 | 629677 | 630861 | 638291 | 636822 |
Andrew M. Cuomo | 443762 | | 441760 | 451439 | 461461 | 474945 | 478916 | 483764 | 482636 | 488448 | 486365 |
Brad Lander | 234621 | 527418 | | 545138 | 578968 | 601410 | 618724 | 609053 | 615701 | 628846 | 628094 |
Adrienne E. Adams | 196728 | 457755 | 205384 | | 506322 | 470926 | 564461 | 523248 | 558147 | 573839 | 569245 |
Scott M. Stringer | 166337 | 205837 | 141462 | 198164 | | 271899 | 308832 | 310799 | 312088 | 328159 | 325313 |
Zellnor Myrie | 99434 | 369199 | 98415 | 184369 | 356482 | | 414876 | 378000 | 411376 | 425323 | 420203 |
Whitney R. Tilson | 73668 | 45581 | 64697 | 74280 | 75909 | 85119 | | 94676 | 85301 | 97673 | 93834 |
Michael Blake | 49744 | 231199 | 65153 | 110878 | 239145 | 133980 | 262823 | | 252421 | 266401 | 264026 |
Jessica Ramos | 58642 | 99085 | 76932 | 92653 | 112377 | 119180 | 143295 | 140286 | | 149848 | 143194 |
Paperboy Love Prince | 15927 | 45553 | 24365 | 36537 | 47366 | 43714 | 56089 | 51045 | 51720 | | 56993 |
Selma K. Bartholomew | 20586 | 42196 | 39792 | 41491 | 45194 | 53501 | 58270 | 55465 | 49128 | 59946 | |

The rows are sorted with the first preferences vote on top.

Looking at the first row with Zohran Kwame Mamdani, for every other candidate, more voters preferred him over the other. Therefore he is the Condorcet winner.

### Distribution of ranks

```
Distribution of ranks for Zohran Kwame Mamdani
Rank 1: 469018 (42.09%)
Rank 2: 87851 (7.88%)
Rank 3: 36878 (3.31%)
Rank 4: 21803 (1.96%)
Rank 5: 24790 (2.22%)
Unranked: 474093 (42.54%)

Distribution of ranks for Brad Lander
Rank 1: 120544 (10.82%)
Rank 2: 365852 (32.83%)
Rank 3: 83792 (7.52%)
Rank 4: 38955 (3.50%)
Rank 5: 23768 (2.13%)
Unranked: 481522 (43.21%)

Distribution of ranks for Adrienne E. Adams
Rank 1: 43941 (3.94%)
Rank 2: 118748 (10.66%)
Rank 3: 256896 (23.05%)
Rank 4: 96574 (8.67%)
Rank 5: 63428 (5.69%)
Unranked: 534846 (47.99%)

Distribution of ranks for Andrew M. Cuomo
Rank 1: 385398 (34.58%)
Rank 2: 45865 (4.12%)
Rank 3: 23565 (2.11%)
Rank 4: 13992 (1.26%)
Rank 5: 21580 (1.94%)
Unranked: 624033 (56.00%)

Distribution of ranks for Zellnor Myrie
Rank 1: 10554 (0.95%)
Rank 2: 43461 (3.90%)
Rank 3: 97617 (8.76%)
Rank 4: 202670 (18.19%)
Rank 5: 76309 (6.85%)
Unranked: 683822 (61.36%)

Distribution of ranks for Scott M. Stringer
Rank 1: 17668 (1.59%)
Rank 2: 75944 (6.81%)
Rank 3: 90747 (8.14%)
Rank 4: 87282 (7.83%)
Rank 5: 61178 (5.49%)
Unranked: 781614 (70.14%)

Distribution of ranks for Michael Blake
Rank 1: 4313 (0.39%)
Rank 2: 20846 (1.87%)
Rank 3: 56475 (5.07%)
Rank 4: 57691 (5.18%)
Rank 5: 131048 (11.76%)
Unranked: 844060 (75.74%)

Distribution of ranks for Jessica Ramos
Rank 1: 4165 (0.37%)
Rank 2: 24356 (2.19%)
Rank 3: 36278 (3.26%)
Rank 4: 41041 (3.68%)
Rank 5: 48968 (4.39%)
Unranked: 959625 (86.11%)

Distribution of ranks for Whitney R. Tilson
Rank 1: 8416 (0.76%)
Rank 2: 31397 (2.82%)
Rank 3: 19056 (1.71%)
Rank 4: 20575 (1.85%)
Rank 5: 20978 (1.88%)
Unranked: 1014011 (90.99%)

Distribution of ranks for Selma K. Bartholomew
Rank 1: 1447 (0.13%)
Rank 2: 9221 (0.83%)
Rank 3: 16250 (1.46%)
Rank 4: 17622 (1.58%)
Rank 5: 18845 (1.69%)
Unranked: 1051048 (94.31%)

Distribution of ranks for Paperboy Love Prince
Rank 1: 1543 (0.14%)
Rank 2: 7378 (0.66%)
Rank 3: 10203 (0.92%)
Rank 4: 11337 (1.02%)
Rank 5: 30704 (2.76%)
Unranked: 1053268 (94.51%)
```

