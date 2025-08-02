type LinkProps = React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

export function ExternalLink({ children, className, ...props }: LinkProps) {
  return (
    <a
      className={`text-blue-500 underline ` + (className ?? "")}
      rel="noopener"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
}
