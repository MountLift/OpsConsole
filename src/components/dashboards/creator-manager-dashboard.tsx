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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-lift" />
            <h1 className="text-2xl font-display font-bold tracking-tight">Creator Roster</h1>
          </div>
          <p className="text-sm text-muted">Talent roster management, platform profiles, and engagement performance.</p>
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

      {/* Creator Roster Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-paper">Roster Profiles</h2>
          <Link href="/creators" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">
            <span>Manage all creators ({creators.length})</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.length === 0 ? (
            <div className="col-span-full card p-6 text-center text-sm text-muted">
              No creators on your roster yet.{" "}
              <Link href="/creators" className="text-lift hover:underline font-medium">
                Add your first creator
              </Link>
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