import type { JSX } from "solid-js/jsx-runtime";

type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink(props: LinkProps) {
  return (
    <a
      class={
        `text-blue-500 underline dark:text-blue-200 ` + (props.class ?? "")
      }
      rel="noopener"
      target="_blank"
      {...props}
    >
      {props.children}
    </a>
  );
}
