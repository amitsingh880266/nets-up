import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...rest }: Readonly<Props>) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/20 backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
