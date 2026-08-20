import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampaignForm from "./campaign-form";
import DeleteButton from "@/components/delete-button";
import { deleteCampaign } from "./actions";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function CampaignsPage() {
  const [campaigns, brands] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { brand: true, _count: { select: { deliverables: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Campaigns</h1>
      <p className="text-sm text-muted mb-6">Every campaign, linked to its brand and deliverables.</p>

      <CampaignForm brands={brands} />

      <div className="card divide-y divide-line">
        {campaigns.length === 0 && (
          <div className="p-4 text-sm text-muted">No campaigns yet — add one above.</div>
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
                onDelete={() => deleteCampaign(c.id)}
                confirmMessage={`Remove ${c.name}? This also removes its ${c._count.deliverables} deliverable${c._count.deliverables === 1 ? "" : "s"} and any payouts/invoices tied to it.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
