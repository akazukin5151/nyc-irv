type PowProps = {
  base: number;
  power: number;
};

export function Pow(props: PowProps) {
  return (
    <math>
      <msup>
        <mn>{props.base}</mn>
        <mn>{props.power}</mn>
      </msup>
    </math>
  );
}
