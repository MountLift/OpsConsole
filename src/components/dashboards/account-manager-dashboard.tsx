import Link from "next/link";
import { Briefcase, Plus, ArrowRight, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";

const COLUMNS = [
  { status: "PLANNING", label: "Planning", color: "text-paper border-paper/20 bg-paper/10" },
  { status: "ACTIVE", label: "Active", color: "text-lift border-lift/20 bg-lift/10" },
  { status: "COMPLETE", label: "Complete", color: "text-lift border-lift/30 bg-lift/20" },
  { status: "CANCELLED", label: "Cancelled", color: "text-amber border-amber/20 bg-amber/10" },
] as const;

export default async function AccountManagerDashboard() {
  const [campaigns, brandCount, creatorCount] = await Promise.all([
    prisma.campaign.findMany({
      include: { brand: true, _count: { select: { deliverables: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.count(),
    prisma.creator.count(),
  ]);

  const byStatus = (status: string) => campaigns.filter((c) => c.status === status);
  const activeCampaigns = byStatus("ACTIVE").length;
  const planningCampaigns = byStatus("PLANNING").length;
  const completedCampaigns = byStatus("COMPLETE").length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Briefcase size={18} className="text-lift" />
        <h1 className="text-xl font-display font-semibold">Campaign Pipeline</h1>
      </div>
      <p className="text-sm text-muted mb-6">Every campaign, grouped by where it stands.</p>

      <div className="card border-lift/40 bg-gradient-to-r from-lift/10 via-ink to-panel p-4 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lift mb-2">AI summary</div>
        <div className="text-sm text-paper">{aiSummary}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {roleWidgets.map((widget) => (
          <div key={widget.label} className="card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{widget.label}</div>
            <div className="text-2xl font-medium text-lift mt-2">{widget.value}</div>
            <div className="text-[11px] text-muted mt-1">{widget.hint}</div>
          </div>
          <p className="text-sm text-muted">Manage campaign workflows, brand client relations, and deliverables.</p>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity w-fit"
        >
          <Plus size={14} />
          <span>New Campaign</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">Active Campaigns</div>
          <div className="text-2xl font-display font-semibold text-lift">{activeCampaigns}</div>
          <div className="text-[11px] text-muted mt-1">Currently running live</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">In Planning</div>
          <div className="text-2xl font-display font-semibold text-paper">{planningCampaigns}</div>
          <div className="text-[11px] text-muted mt-1">Setup & onboarding</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">Brands Represented</div>
          <div className="text-2xl font-display font-semibold text-paper">{brandCount}</div>
          <div className="text-[11px] text-muted mt-1">Active client accounts</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">Roster Talent</div>
          <div className="text-2xl font-display font-semibold text-lift">{creatorCount}</div>
          <div className="text-[11px] text-muted mt-1">Available creators</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = byStatus(col.status);
          return (
            <div key={col.status} className="card p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="text-xs font-mono text-muted uppercase tracking-wide">{col.label}</div>
                <div className="text-xs font-mono text-lift">{items.length}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}