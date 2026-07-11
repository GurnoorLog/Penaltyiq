import { content } from "@/lib/content";

const iconMap: Record<string, string> = {
  upload: "\u{1F4C1}",
  track: "\u{1F50D}",
  score: "\u{1F3C6}",
  coach: "\u{1F3AF}",
};

export function FeatureCards() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.features.map((feature) => (
          <div key={feature.title} className="glass-panel-lg p-6 hover:bg-[var(--glass)] transition-colors">
            <div className="text-3xl mb-4">{iconMap[feature.icon] ?? "\u2728"}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
