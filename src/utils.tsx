import type { Component } from "solid-js";

export const FormattedNumber: Component<{ value: number }> = (props: {
  value: number;
}) => {
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
  };
  // retain reactivity with a func
  const str = () => Intl.NumberFormat("en-US", options).format(props.value);
  return <>{str()}</>;
};
