import { content } from "@/lib/content";

export default function DemoPage() {
  return (
    <div className="pt-20 min-h-screen bg-grid px-4 flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">{content.demo.title}</h1>
        <p className="text-lg text-[var(--text-muted)] mb-8">{content.demo.description}</p>
        <div className="glass-panel-lg p-8 aspect-video flex items-center justify-center">
          <p className="text-[var(--text-muted)]">Demo video placeholder</p>
        </div>
      </div>
    </div>
  );
}
