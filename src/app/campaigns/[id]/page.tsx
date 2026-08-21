import { prisma } from "@/lib/prisma";
import DeliverableForm from "./deliverable-form";
import DeleteButton from "@/components/delete-button";
import { deleteDeliverable } from "../actions";
import { notFound } from "next/navigation";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [campaign, creators] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        deliverables: { include: { creator: true, payouts: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.creator.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!campaign) notFound();

  const totalPayouts = campaign.deliverables.reduce(
    (sum, d) => sum + d.payouts.reduce((s, p) => s + Number(p.amount), 0),
    0
  );

  return (
    <div>
      <div className="text-xs text-muted mb-1">{campaign.brand.name}</div>
      <h1 className="text-xl font-display font-semibold mb-1">{campaign.name}</h1>
      <p className="text-sm text-muted mb-6">
        Budget {money(Number(campaign.budget))} · Payouts committed {money(totalPayouts)} · Status {campaign.status}
      </p>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Deliverables</h2>

      <DeliverableForm campaignId={campaign.id} creators={creators} />

      <div className="card divide-y divide-line">
        {campaign.deliverables.length === 0 && (
          <div className="p-4 text-sm text-muted">No deliverables yet — add one above.</div>
        )}
        {campaign.deliverables.map((d) => (
          <div key={d.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">
                {d.creator.name} · {d.type}
              </div>
              <div className="text-muted text-xs">
                Status {d.status} · {d.payouts.length > 0 ? d.payouts[0].status : "no payout logged"}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lift font-mono">{money(Number(d.agreedRate))}</div>
              <DeleteButton
                action={deleteDeliverable.bind(null, d.id, campaign.id)}
                confirmMessage={`Remove this ${d.type.toLowerCase()} from ${d.creator.name}? This also removes any payout logged against it.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
