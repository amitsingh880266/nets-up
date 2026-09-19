import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-lime-400 text-black hover:bg-lime-300 active:scale-[0.98]",
  secondary: "bg-white/10 text-white hover:bg-white/15 active:scale-[0.98]",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
  danger: "bg-red-500/90 text-white hover:bg-red-500 active:scale-[0.98]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Readonly<Props>) {
  return (
    <button
      className={`min-h-[48px] rounded-2xl px-6 py-3 font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
