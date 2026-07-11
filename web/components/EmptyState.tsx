import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  cta?: string;
  href?: string;
}

export function EmptyState({ title, description, cta, href }: EmptyStateProps) {
  return (
    <div className="pt-20 min-h-screen bg-grid px-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6 opacity-50">🎲</div>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-[var(--text-muted)] mb-6">{description}</p>
        {cta && href && (
          <Link
            href={href}
            className="inline-block px-6 py-2.5 rounded-xl accent-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}
