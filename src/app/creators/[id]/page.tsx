import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/require-access";
import { notFound } from "next/navigation";
import { Sparkles, Calendar, BarChart3, ChevronDown, CheckCircle2 } from "lucide-react";
import DeleteButton from "@/components/delete-button";
import { deleteCreator } from "../actions";
import { requireContext, creatorScope } from "@/lib/access";

function pct(n: number | null | undefined) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `${n.toFixed(1)}%`;
}

function num(n: number | null | undefined) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function consistencyColor(label: string | null | undefined) {
  const l = String(label ?? "").toLowerCase();
  if (l.includes("consistent") && !l.includes("in")) return "bg-lift/10 text-lift border-lift/20";
  if (l.includes("somewhat")) return "bg-paper/10 text-paper border-paper/20";
  if (l.includes("highly")) return "bg-amber/10 text-amber border-amber/20";
  return "bg-panel text-muted border-line";
}

export default async function CreatorProfilePage({ params }: { params: { id: string } }) {
  await requireAccess("/creators");
  const context = await requireContext();

  const creator = await prisma.creator.findUnique({
    where: { id: params.id, ...creatorScope(context) },
    include: {
      _count: { select: { deliverables: true } },
      insights: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!creator) notFound();

  const latestInsight = creator.insights[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link href="/creators" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-lift mb-3 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Creators</span>
        </Link>

        {/* Hero Creator Header */}
        <div className="card p-6 bg-panel/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-lift/10 border border-lift/20 text-lift flex items-center justify-center font-display font-bold text-lg uppercase">
                {creator.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold tracking-tight text-paper">{creator.name}</h1>
                <div className="text-xs text-muted font-mono flex items-center gap-2 mt-0.5">
                  <span className="text-lift">{creator.handle ? (creator.handle.startsWith("@") ? creator.handle : `@${creator.handle}`) : "No handle"}</span>
                  <span>•</span>
                  <span>{creator.platform || "Platform unassigned"}</span>
                  {creator.email && (
                    <>
                      <span>•</span>
                      <span>{creator.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-panel text-muted border border-line">
                {creator._count.deliverables} deliverable{creator._count.deliverables === 1 ? "" : "s"}
              </span>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity"
              >
                <BarChart3 size={14} />
                <span>Run Audit</span>
              </Link>
              {context.role === "ADMIN" && <DeleteButton
                onDelete={deleteCreator.bind(null, creator.id)}
                confirmMessage={`Remove ${creator.name}? This also removes their deliverables and audit insights.`}
              />}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Audit Insights Snapshot */}
      {latestInsight ? (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-lift" />
              <h2 className="text-sm font-display font-semibold text-paper">Latest Engagement Snapshot</h2>
              <span className="text-[11px] text-muted font-mono">
                ({new Date(latestInsight.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
              </span>
            </div>

            {latestInsight.consistencyLabel && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${consistencyColor(latestInsight.consistencyLabel)}`}>
                {latestInsight.consistencyLabel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Engagement Rate</div>
              <div className="text-xl font-semibold text-lift mt-1">{pct(latestInsight.engagementRate)}</div>
            </div>

            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Average Views</div>
              <div className="text-xl font-semibold text-paper mt-1">{num(latestInsight.avgViews)}</div>
            </div>

            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Median Views</div>
              <div className="text-base font-medium text-paper mt-1">{num(latestInsight.medianViews)}</div>
            </div>

            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Average Likes</div>
              <div className="text-base font-medium text-paper mt-1">{num(latestInsight.avgLikes)}</div>
            </div>

            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Average Comments</div>
              <div className="text-base font-medium text-paper mt-1">{num(latestInsight.avgComments)}</div>
            </div>

            <div className="p-3 rounded-lg bg-ink border border-line">
              <div className="text-muted text-[10px] uppercase">Post Frequency</div>
              <div className="text-base font-medium text-paper mt-1">
                {latestInsight.postingFrequencyDays != null ? `${num(latestInsight.postingFrequencyDays)}d avg` : "—"}
              </div>
            </div>

            {latestInsight.viewToFollowerRatio != null && (
              <div className="p-3 rounded-lg bg-ink border border-line col-span-2 sm:col-span-2">
                <div className="text-muted text-[10px] uppercase">Views / Follower Ratio</div>
                <div className="text-base font-semibold text-lift mt-1">{pct(latestInsight.viewToFollowerRatio * 100)}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center text-sm text-muted">
          No audit snapshots saved yet for {creator.name}.{" "}
          <Link href="/insights" className="text-lift hover:underline font-medium">
            Run an Instagram audit
          </Link>
        </div>
      )}

      {/* Audit History Chronological Table */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-lift" />
            <span>Audit History Log</span>
          </span>
          <span>{creator.insights.length} snapshots</span>
        </h2>

        <div className="card divide-y divide-line overflow-hidden">
          {creator.insights.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">No historical snapshots recorded yet.</div>
          ) : (
            creator.insights.map((insight) => (
              <div key={insight.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-paper">
                      {new Date(insight.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {insight.consistencyLabel && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${consistencyColor(insight.consistencyLabel)}`}>
                        {insight.consistencyLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-muted">
                    <span>ER: <strong className="text-lift">{pct(insight.engagementRate)}</strong></span>
                    <span>Avg Views: <strong className="text-paper">{num(insight.avgViews)}</strong></span>
                    <span>Avg Likes: <strong className="text-paper">{num(insight.avgLikes)}</strong></span>
                  </div>
                </div>

                <details className="group">
                  <summary className="text-[11px] text-muted cursor-pointer hover:text-lift flex items-center gap-1 font-mono">
                    <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                    <span>Raw Response Snapshot</span>
                  </summary>
                  <pre className="text-[11px] font-mono text-muted bg-ink p-3 rounded-lg border border-line mt-1 overflow-x-auto max-h-36">
                    {JSON.stringify(insight.raw, null, 2)}
                  </pre>
                </details>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
