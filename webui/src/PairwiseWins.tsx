export function PairwiseWins() {
  return (
    <>
      <div className="rounded-md bg-white pb-3 shadow-md">
        <h2 className="ml-4 pt-2">Number of pairwise wins</h2>

        <table className="mt-2 ml-4 [&_td]:border-b-2 [&_td]:border-neutral-200/50 [&_td]:px-3 [&_td]:py-1 [&_td]:nth-[2n]:text-right [&_th]:px-3 [&_th]:py-1">
          <thead className="bg-neutral-200">
            <tr>
              <th>Candidate</th>
              <th>Number of pairwise wins</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Zohran Kwame Mamdani</td>
              <td>10</td>
            </tr>
            <tr>
              <td>Brad Lander</td>
              <td>9</td>
            </tr>
            <tr>
              <td>Adrienne E. Adams</td>
              <td>8</td>
            </tr>
            <tr>
              <td>Andrew M. Cuomo</td>
              <td>7</td>
            </tr>
            <tr>
              <td>Zellnor Myrie</td>
              <td>6</td>
            </tr>
            <tr>
              <td>Scott M. Stringer</td>
              <td>5</td>
            </tr>
            <tr>
              <td>Michael Blake</td>
              <td>4</td>
            </tr>
            <tr>
              <td>Jessica Ramos</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Whitney R. Tilson</td>
              <td>2</td>
            </tr>
            <tr>
              <td>Selma K. Bartholomew</td>
              <td>1</td>
            </tr>
            <tr>
              <td>Paperboy Love Prince</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
