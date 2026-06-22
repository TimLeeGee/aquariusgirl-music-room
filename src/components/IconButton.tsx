import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "glass" | "primary" | "ghost" | "danger";
};

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

const variantClasses = {
  glass:
    "border-white/[0.15] bg-white/10 text-white hover:border-aquarius-blue/50 hover:bg-aquarius-blue/[0.15]",
  primary:
    "border-aquarius-blue/60 bg-aquarius-blue text-aquarius-navy hover:bg-white",
  ghost:
    "border-transparent bg-transparent text-aquarius-mist hover:bg-white/10 hover:text-white",
  danger:
    "border-white/10 bg-white/5 text-aquarius-mist hover:border-red-300/50 hover:bg-red-500/20 hover:text-red-100",
};

export function IconButton({
  icon,
  label,
  active = false,
  size = "md",
  variant = "glass",
  className = "",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border transition duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aquarius-blue",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-aquarius-pink/70 bg-aquarius-pink/20 text-white shadow-pink"
          : variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...buttonProps}
    >
      {icon}
    </button>
  );
}
