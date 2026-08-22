import Link from "next/link";
import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";

const COLUMNS = [
  { status: "PLANNING", label: "Planning" },
  { status: "ACTIVE", label: "Active" },
  { status: "COMPLETE", label: "Complete" },
  { status: "CANCELLED", label: "Cancelled" },
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
  const aiSummary = `AI summary: ${activeCampaigns} campaigns are live, ${planningCampaigns} are still in planning, and ${byStatus("COMPLETE").length} are already delivered.`;

  const roleWidgets = [
    { label: "Live campaigns", value: activeCampaigns, hint: "Currently active" },
    { label: "In planning", value: planningCampaigns, hint: "Needs attention" },
    { label: "Delivered", value: byStatus("COMPLETE").length, hint: "Completed this cycle" },
  ];

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

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {roleWidgets.map((widget) => (
          <div key={widget.label} className="card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{widget.label}</div>
            <div className="text-2xl font-medium text-lift mt-2">{widget.value}</div>
            <div className="text-[11px] text-muted mt-1">{widget.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Total campaigns</div>
          <div className="text-2xl font-medium text-lift font-mono">{campaigns.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Brands</div>
          <div className="text-2xl font-medium text-lift font-mono">{brandCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Creators on roster</div>
          <div className="text-2xl font-medium text-lift font-mono">{creatorCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = byStatus(col.status);
          return (
            <div key={col.status} className="card p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="text-xs font-mono text-muted uppercase tracking-wide">{col.label}</div>
                <div className="text-xs font-mono text-lift">{items.length}</div>
              </div>
              <div className="space-y-2">
                {items.length === 0 && (
                  <div className="text-xs text-muted px-1 py-2">Nothing here.</div>
                )}
                {items.map((c) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="block bg-ink border border-line rounded-md px-3 py-2 hover:border-lift transition-colors"
                  >
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {c.brand.name} · {c._count.deliverables} deliverables
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}