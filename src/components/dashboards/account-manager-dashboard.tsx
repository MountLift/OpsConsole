import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext, brandScope, campaignScope, creatorScope } from "@/lib/access";

const COLUMNS = [
  { status: "PLANNING", label: "Planning", color: "text-paper border-paper/20 bg-paper/10" },
  { status: "ACTIVE", label: "Active", color: "text-lift border-lift/20 bg-lift/10" },
  { status: "COMPLETE", label: "Complete", color: "text-lift border-lift/30 bg-lift/20" },
  { status: "CANCELLED", label: "Cancelled", color: "text-amber border-amber/20 bg-amber/10" },
] as const;

export default async function AccountManagerDashboard() {
  const context = await requireContext();
  const [campaigns, brandCount, creatorCount] = await Promise.all([
    prisma.campaign.findMany({
      where: campaignScope(context),
      include: { brand: true, _count: { select: { deliverables: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.count({ where: brandScope(context) }),
    prisma.creator.count({ where: creatorScope(context) }),
  ]);

  const byStatus = (status: string) => campaigns.filter((c) => c.status === status);
  const activeCampaigns = byStatus("ACTIVE").length;
  const planningCampaigns = byStatus("PLANNING").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Assigned accounts</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Campaign pipeline</h1>
          <p className="text-sm text-muted mt-1">{activeCampaigns} active · {planningCampaigns} in planning</p>
        </div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity w-fit"
        >
          <span>Open campaigns</span><ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 col-span-2">
          <div className="text-xs text-muted font-medium mb-1">Active Campaigns</div>
          <div className="text-4xl font-display font-semibold text-lift">{activeCampaigns}</div>
          <div className="text-[11px] text-muted mt-1">Campaigns currently running for your accounts</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">In Planning</div>
          <div className="text-2xl font-display font-semibold text-paper">{planningCampaigns}</div>
          <div className="text-[11px] text-muted mt-1">Waiting to go live</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">Brands Represented</div>
          <div className="text-2xl font-display font-semibold text-lift">{brandCount}</div>
          <div className="text-[11px] text-muted mt-1">{brandCount === 1 ? "Client account" : "Client accounts"}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted font-medium mb-1">Roster Talent</div>
          <div className="text-2xl font-display font-semibold text-paper">{creatorCount}</div>
          <div className="text-[11px] text-muted mt-1">Creators on assigned work</div>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-paper">Campaign lifecycle</h2>
          <Link href="/campaigns" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">
            <span>All {campaigns.length} campaigns</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = byStatus(col.status);
            return (
              <div key={col.status} className="card p-4 flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-line">
                    <span className="text-xs font-mono font-semibold tracking-wider uppercase text-paper">
                      {col.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${col.color}`}>
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {items.length === 0 ? (
                      <div className="text-xs text-muted p-3 text-center rounded border border-dashed border-line">
                        No campaigns in {col.label.toLowerCase()}
                      </div>
                    ) : (
                      items.map((c) => (
                        <Link
                          key={c.id}
                          href={`/campaigns/${c.id}`}
                          className="block p-3 rounded-lg bg-ink border border-line hover:border-lift transition-colors group"
                        >
                          <div className="text-sm font-medium text-paper group-hover:text-lift transition-colors truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-muted flex items-center justify-between mt-1 font-mono">
                            <span>{c.brand.name}</span>
                            <span>{c._count.deliverables} deliverable{c._count.deliverables === 1 ? "" : "s"}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
