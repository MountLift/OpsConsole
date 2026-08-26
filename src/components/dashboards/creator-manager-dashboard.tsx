import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext, creatorScope } from "@/lib/access";

export default async function CreatorManagerDashboard() {
  const context = await requireContext();
  const [creators, updates] = await Promise.all([
    prisma.creator.findMany({ where: creatorScope(context), orderBy: { createdAt: "desc" }, include: { _count: { select: { deliverables: true } }, insights: { take: 1, orderBy: { createdAt: "desc" }, select: { engagementRate: true, createdAt: true } } } }),
    prisma.managerUpdate.findMany({ where: { targetClerkUserId: context.clerkUserId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const igReady = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  ).length;
  const needsFollowUp = creators.filter((c) => !c.handle || !c.platform).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="eyebrow">My assignments</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Creator roster</h1>
          <p className="text-sm text-muted mt-1">{needsFollowUp ? `${needsFollowUp} profile${needsFollowUp === 1 ? "" : "s"} need setup before outreach.` : "Every assigned profile has a basic setup."}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <span>My creators</span>
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity"
          >
            <BarChart3 size={14} />
            <span>Run IG Audit</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 sm:col-span-2">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Creator Roster</div>
            <div className="text-4xl font-display font-semibold text-paper">{creators.length}</div>
            <div className="text-[11px] text-muted mt-1">Profiles assigned to you</div>
          </div>
        </div>

        <div className="card p-5">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Instagram Ready</div>
            <div className="text-2xl font-display font-semibold text-lift">{igReady}</div>
            <div className="text-[11px] text-muted mt-1">Handles ready to audit</div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${needsFollowUp > 0 ? "border-amber/30 bg-amber/10" : "card"}`}>
          <div>
            <div className="text-xs text-muted font-medium mb-1">Needs Profile Setup</div>
            <div className={`text-2xl font-display font-semibold ${needsFollowUp > 0 ? "text-amber" : "text-lift"}`}>{needsFollowUp}</div>
            <div className="text-[11px] text-muted mt-1">Missing handle or platform</div>
          </div>
        </div>
      </div>

      {/* Analytics Shortcut Banner */}
      <Link
        href="/insights"
        className="card p-5 flex items-center justify-between bg-gradient-to-r from-panel via-ink to-panel hover:border-lift transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-sm font-display font-semibold text-paper group-hover:text-lift transition-colors">
              Run Creator Engagement Audit
            </div>
            <div className="text-xs text-muted">Analyze engagement rates, average views, and posting consistency for any creator</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-lift group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold text-paper">Updates from Admin</h2>
          <span className="text-[10px] font-mono text-muted">PRIVATE</span>
        </div>
        {updates.length === 0 ? <p className="p-5 text-sm text-muted">No updates have been assigned to you yet.</p> : (
          <div className="divide-y divide-line">{updates.map((update) => (
            <article key={update.id} className="px-5 py-4">
              <h3 className="text-sm font-medium text-paper">{update.title}</h3>
              <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{update.body}</p>
              <time className="text-[10px] font-mono text-muted mt-2 block">{update.createdAt.toLocaleDateString()}</time>
            </article>
          ))}</div>
        )}
      </div>

      {/* Creator Roster Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-paper">Roster profiles</h2>
          <Link href="/creators" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">
            <span>All {creators.length} creators</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.length === 0 ? (
            <div className="col-span-full card p-6 text-center text-sm text-muted">
              No creators have been assigned to you yet.
            </div>
          ) : (
            creators.map((c) => {
              const latestInsight = c.insights[0];
              return <Link key={c.id} href={`/creators/${c.id}`} className="card p-4 flex flex-col justify-between hover:border-lift/40 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-lift/10 border border-lift/20 text-lift flex items-center justify-center font-display font-bold text-xs uppercase">
                      {c.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-paper truncate">{c.name}</div>
                      <div className="text-xs text-muted font-mono truncate">
                        {c.handle ? (c.handle.startsWith("@") ? c.handle : `@${c.handle}`) : "No handle"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-mono">
                  <span className="text-muted">{c.platform || "Unassigned"}</span>
                  <span className={latestInsight ? "text-lift" : "text-muted"}>{latestInsight?.engagementRate != null ? `${latestInsight.engagementRate.toFixed(1)}% ER` : latestInsight ? "Audit saved" : "No audit yet"}</span>
                </div>
              </Link>;
            })
          )}
        </div>
      </div>
    </div>
  );
}
