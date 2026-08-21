import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampaignForm from "./campaign-form";
import DeleteButton from "@/components/delete-button";
import { deleteCampaign } from "./actions";
import { CampaignStatus } from "@prisma/client";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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

  const [campaigns, brands] = await Promise.all([
    prisma.campaign.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { brand: true, _count: { select: { deliverables: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasFilter = Boolean(query || statusFilter);

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Campaigns</h1>
      <p className="text-sm text-muted mb-6">Every campaign, linked to its brand and deliverables.</p>

      <CampaignForm brands={brands} />

      <form method="GET" className="flex items-center gap-3 mb-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search campaigns or brands…"
          className="input flex-1"
        />
        <select name="status" defaultValue={statusFilter} className="input">
          <option value="">All statuses</option>
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

      <div className="card divide-y divide-line">
        {campaigns.length === 0 && (
          <div className="p-4 text-sm text-muted">
            {hasFilter ? "No campaigns match your filter criteria." : "No campaigns yet — add one above."}
          </div>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <Link href={`/campaigns/${c.id}`} className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted text-xs">
                {c.brand.name} · {c._count.deliverables} deliverables · {c.status}
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-lift font-mono">{money(Number(c.budget))}</div>
              <DeleteButton
                action={deleteCampaign.bind(null, c.id)}
                confirmMessage={`Remove ${c.name}? This also removes its ${c._count.deliverables} deliverable${c._count.deliverables === 1 ? "" : "s"} and any payouts/invoices tied to it.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
