"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { content } from "@/lib/content";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

interface SessionRow {
  id: string;
  createdAt: string;
  title: string | null;
  thumbnailUrl: string | null;
  status: string;
  techniqueScore: number | null;
}

function HistoryList() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/history?userId=${session.user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) {
    return <div className="pt-20 text-center text-[var(--text-muted)]">Loading...</div>;
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={content.history.emptyTitle}
        description={content.history.emptyDescription}
        cta={content.history.emptyCta}
        href="/start"
      />
    );
  }

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400",
    processing: "text-blue-400",
    complete: "text-green-400",
    error: "text-red-400",
  };

  return (
    <div className="pt-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{content.history.title}</h1>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="glass-panel-lg p-4 flex items-center gap-4">
            <div className="w-16 h-12 rounded-lg bg-[var(--glass)] flex items-center justify-center text-2xl">
              {s.thumbnailUrl ? (
                <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                "🎲"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{s.title ?? "Penalty Session"}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(s.createdAt).toLocaleDateString()}
                {s.techniqueScore != null && ` • Score: ${s.techniqueScore}`}
              </p>
            </div>
            <span className={`text-xs font-medium ${statusColors[s.status] ?? ""}`}>
              {content.history[`status${s.status.charAt(0).toUpperCase() + s.status.slice(1)}` as keyof typeof content.history] ?? s.status}
            </span>
            {s.status === "complete" && (
              <Link
                href={`/dashboard?session=${s.id}`}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                {content.history.viewLink}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return <HistoryList />;
}
