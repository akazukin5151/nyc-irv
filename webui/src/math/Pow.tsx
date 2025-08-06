type PowProps = {
  base: number;
  power: number;
};

export function Pow({ base, power }: PowProps) {
  return (
    <math>
      <msup>
        <mn>{base}</mn>
        <mn>{power}</mn>
      </msup>
    </math>
  );
}
