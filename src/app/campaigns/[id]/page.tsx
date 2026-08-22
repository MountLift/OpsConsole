import { prisma } from "@/lib/prisma";
import DeliverableForm from "./deliverable-form";
import CampaignHeader from "./campaign-header";
import DeleteButton from "@/components/delete-button";
import { deleteDeliverable } from "../actions";
import { requireAccess } from "@/lib/require-access";
import { canSeeMoney } from "@/lib/roles";
import { notFound } from "next/navigation";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const role = await requireAccess("/campaigns");
  const showMoney = canSeeMoney(role);

  const [campaign, creators] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        deliverables: { include: { creator: true, payouts: true }, orderBy: { createdAt: "desc" } },
        invoices: true,
      },
    }),
    prisma.creator.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!campaign) notFound();

  const totalPayouts = campaign.deliverables.reduce(
    (sum, d) => sum + d.payouts.reduce((s, p) => s + Number(p.amount), 0),
    0
  );
  const totalInvoiced = campaign.invoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const profit = totalInvoiced - totalPayouts;

  return (
    <div>
      <CampaignHeader
        campaign={{
          id: campaign.id,
          name: campaign.name,
          budget: Number(campaign.budget),
          status: campaign.status,
          brand: { name: campaign.brand.name },
        }}
        showBudget={showMoney}
      />

      {showMoney && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card p-4">
            <div className="text-xs text-muted mb-2">Invoiced to brand</div>
            <div className="text-2xl font-medium text-lift">{money(totalInvoiced)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted mb-2">Paid out to creators</div>
            <div className="text-2xl font-medium text-amber">{money(totalPayouts)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted mb-2">Profit</div>
            <div className={`text-2xl font-medium ${profit >= 0 ? "text-lift" : "text-amber"}`}>
              {money(profit)}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Deliverables</h2>

      <DeliverableForm campaignId={campaign.id} creators={creators} showRate={showMoney} />

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
                Status {d.status}
                {showMoney && ` · ${d.payouts.length > 0 ? d.payouts[0].status : "no payout logged"}`}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {showMoney && <div className="text-lift font-mono">{money(Number(d.agreedRate))}</div>}
              <DeleteButton
                onDelete={deleteDeliverable.bind(null, d.id, campaign.id)}
                confirmMessage={`Remove this ${d.type.toLowerCase()} from ${d.creator.name}? This also removes any payout logged against it.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
