import type { JSX } from "solid-js/jsx-runtime";
import "./Sticky.css";

type StickyProps = {
  children?: JSX.Element;
  class_?: string;
};

export function Sticky(props: StickyProps) {
  return (
    <>
      <div
        class={
          `sticky-blurred-div sticky top-0 z-1 rounded-lg px-4 py-2 dark:text-white `
          + (props.class_ ?? "")
        }
        {...props}
      >
        {props.children}
      </div>
      <div class="shadow-under-blur" />
      <div class="relative">
        <div class="shadow-coverer" />
      </div>
    </>
  );
}
