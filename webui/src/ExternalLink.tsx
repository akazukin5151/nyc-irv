type LinkProps = React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

export function ExternalLink({ children, className, ...props }: LinkProps) {
  return (
    <a
      className={
        `text-blue-500 underline dark:text-blue-200 ` + (className ?? "")
      }
      rel="noopener"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
}
