import Link from "next/link";

interface Props {
  href: string;
  label?: string;
}

export function BackLink({ href, label = "Back" }: Readonly<Props>) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1 text-sm text-white/50 hover:text-white"
    >
      ← {label}
    </Link>
  );
}
