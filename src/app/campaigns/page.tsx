import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampaignForm from "./campaign-form";
import DeleteButton from "@/components/delete-button";
import { deleteCampaign } from "./actions";
import { CampaignStatus } from "@prisma/client";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function statusPill(status: CampaignStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-lift/10 text-lift border-lift/20";
    case "PLANNING":
      return "bg-paper/10 text-paper border-paper/20";
    case "COMPLETE":
      return "bg-lift/20 text-lift border-lift/30";
    case "CANCELLED":
      return "bg-amber/10 text-amber border-amber/20";
    default:
      return "bg-panel text-muted border-line";
  }
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const statusFilter = searchParams?.status?.trim() ?? "";

  const whereClause: any = {};

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { brand: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (statusFilter && Object.values(CampaignStatus).includes(statusFilter as CampaignStatus)) {
    whereClause.status = statusFilter;
  }

  const [campaigns, brands, activeCount, totalBudget] = await Promise.all([
    prisma.campaign.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { brand: true, _count: { select: { deliverables: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaign.aggregate({ _sum: { budget: true } }),
  ]);

  const hasFilter = Boolean(query || statusFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Campaigns</h1>
        <p className="text-sm text-muted">Every campaign, linked to its brand and deliverables.</p>
      </div>

      {/* Campaign Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Active Campaigns</div>
            <div className="text-2xl font-display font-semibold text-lift">{activeCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Allocated Budget</div>
            <div className="text-2xl font-display font-semibold text-paper">
              {money(Number(totalBudget._sum.budget ?? 0))}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-paper/10 border border-paper/20 text-paper">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Campaigns</div>
            <div className="text-2xl font-display font-semibold text-amber">{campaigns.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber/10 border border-amber/20 text-amber">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Campaign Add Form */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Create Campaign</h2>
        <CampaignForm brands={brands} />
      </div>

      {/* Filter Bar */}
      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search campaign name or brand…"
            className="input pl-9"
          />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select name="status" defaultValue={statusFilter} className="input w-48">
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETE">Complete</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="submit" className="btn">
          Filter
        </button>
        {hasFilter && (
          <Link href="/campaigns" className="text-xs text-muted hover:text-amber">
            Clear
          </Link>
        )}
      </form>

      {/* Campaigns List */}
      <div className="card divide-y divide-line overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            {hasFilter ? "No campaigns match your filter criteria." : "No campaigns yet — add one above."}
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="table-row flex items-center justify-between px-5 py-4 text-sm group">
              <Link href={`/campaigns/${c.id}`} className="flex-1">
                <div className="font-medium text-paper group-hover:text-lift transition-colors flex items-center gap-2">
                  <span>{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusPill(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-muted text-xs flex items-center gap-2 mt-1 font-mono">
                  <span>Brand: {c.brand.name}</span>
                  <span>•</span>
                  <span>{c._count.deliverables} deliverable{c._count.deliverables === 1 ? "" : "s"}</span>
                </div>
              </Link>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lift font-mono font-medium">{money(Number(c.budget))}</div>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider">Budget</div>
                </div>
                <DeleteButton
                  action={deleteCampaign.bind(null, c.id)}
                  confirmMessage={`Remove ${c.name}? This also removes its ${c._count.deliverables} deliverable${c._count.deliverables === 1 ? "" : "s"} and any payouts/invoices tied to it.`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
