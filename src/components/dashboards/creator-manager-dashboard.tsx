import Link from "next/link";
import { Sparkles, Plus, ArrowRight, BarChart3, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CreatorManagerDashboard() {
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliverables: true } } },
  });

  const igReady = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  ).length;
  const needsFollowUp = creators.filter((c) => !c.handle || !c.platform).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-lift" />
        <h1 className="text-xl font-display font-semibold">Creator Roster</h1>
      </div>
      <p className="text-sm text-muted mb-6">Everyone on the roster, at a glance.</p>

      <div className="card border-lift/40 bg-gradient-to-r from-lift/10 via-ink to-panel p-4 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lift mb-2">AI summary</div>
        <div className="text-sm text-paper">{aiSummary}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {roleWidgets.map((widget) => (
          <div key={widget.label} className="card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{widget.label}</div>
            <div className="text-2xl font-medium text-lift mt-2">{widget.value}</div>
            <div className="text-[11px] text-muted mt-1">{widget.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Total creators</div>
          <div className="text-2xl font-medium text-lift font-mono">{creators.length}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <Plus size={14} />
            <span>Add Creator</span>
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

      {/* Roster Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Creator Roster</div>
            <div className="text-2xl font-display font-semibold text-paper">{creators.length}</div>
            <div className="text-[11px] text-muted mt-1">Across all platforms</div>
          </div>
          <div className="p-2.5 rounded-lg bg-paper/10 border border-paper/20 text-paper">
            <Users size={18} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Instagram Ready</div>
            <div className="text-2xl font-display font-semibold text-lift">{igReady}</div>
            <div className="text-[11px] text-muted mt-1">Handles ready to audit</div>
          </div>
          <div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Needs Profile Setup</div>
            <div className="text-2xl font-display font-semibold text-amber">{needsFollowUp}</div>
            <div className="text-[11px] text-muted mt-1">Missing handle or platform</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber/10 border border-amber/20 text-amber">
            <Plus size={18} />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {creators.length === 0 && (
          <div className="col-span-full xl:col-span-4 card p-4 text-sm text-muted">
            No creators yet — add one from the Creators tab.
          </div>
        )}
        {creators.map((c) => (
          <div key={c.id} className="card p-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-semibold mb-3 ${avatarTint(c.name)}`}>
              {initials(c.name)}
            </div>
          ) : (
            creators.map((c) => (
              <div key={c.id} className="card p-4 flex flex-col justify-between hover:border-line transition-colors">
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
                  <span className="px-2 py-0.5 rounded text-[10px] bg-panel border border-line text-paper">
                    {c._count.deliverables} posts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}