import { type JSX, type Component, mergeProps } from "solid-js";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  size?: "small" | "normal" | "large";
  active?: boolean;
  kClick?: () => void;
}

const Button: Component<ButtonProps> = (_props): JSX.Element => {
  const props = mergeProps(
    {
      disabled: false,
      size: "normal",
      active: false,
      kClick: () => {},
    },
    _props,
  );

  return (
    <button
      class="bg-stone-700 hover:bg-stone-600 active:bg-stone-700 leading-5 rounded-sm disabled:bg-stone-900"
      classList={{
        "text-red-800": props.disabled,
        "text-sm": props.size === "small",
        "text-base": props.size === "normal",
        "text-lg": props.size === "large",
        "p-0.5": props.size === "small",
        "p-1": props.size === "normal",
        "p-2": props.size === "large",
        ring: props.active,
        "ring-stone-400": props.active,
      }}
      onClick={() => props.kClick()}
      onKeyDown={(e) => {
        e.preventDefault();
      }} // Don't allow spamming with enter
      disabled={props.disabled}
    >
      {props.label}
    </button>
  );
};

export default Button;
