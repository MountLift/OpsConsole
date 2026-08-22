import Link from "next/link";
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
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div>
        <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-lift mb-3 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Campaigns</span>
        </Link>

        {/* Campaign Hero Detail Card */}
        <div className="card p-6 bg-panel/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-lift uppercase tracking-wider mb-1">
                Brand: {campaign.brand.name}
              </div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-paper">{campaign.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-lift/10 text-lift border border-lift/20">
                Status: {campaign.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-line">
            <div>
              <div className="text-xs text-muted font-medium mb-0.5">Campaign Budget</div>
              <div className="text-xl font-display font-semibold text-lift">{money(Number(campaign.budget))}</div>
            </div>

            <div>
              <div className="text-xs text-muted font-medium mb-0.5">Payouts Committed</div>
              <div className="text-xl font-display font-semibold text-amber">{money(totalPayouts)}</div>
            </div>

            <div>
              <div className="text-xs text-muted font-medium mb-0.5">Deliverables Count</div>
              <div className="text-xl font-display font-semibold text-paper">{campaign.deliverables.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Creation Form */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Add Deliverable</h2>
        <DeliverableForm campaignId={campaign.id} creators={creators} />
      </div>

      {/* Deliverables List */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Campaign Deliverables</h2>
        <div className="card divide-y divide-line overflow-hidden">
          {campaign.deliverables.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">No deliverables added yet — create one above.</div>
          ) : (
            campaign.deliverables.map((d) => (
              <div key={d.id} className="table-row flex items-center justify-between px-5 py-4 text-sm group">
                <div>
                  <div className="font-medium text-paper flex items-center gap-2">
                    <span>{d.creator.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-paper/10 text-paper border border-paper/20">
                      {d.type}
                    </span>
                  </div>
                  <div className="text-muted text-xs flex items-center gap-2 mt-1 font-mono">
                    <span>Status: {d.status}</span>
                    <span>•</span>
                    <span>Payout: {d.payouts.length > 0 ? d.payouts[0].status : "No payout logged"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lift font-mono font-medium">{money(Number(d.agreedRate))}</div>
                    <div className="text-[10px] text-muted font-mono uppercase">Agreed Rate</div>
                  </div>
                  <DeleteButton
                    action={deleteDeliverable.bind(null, d.id, campaign.id)}
                    confirmMessage={`Remove this ${d.type.toLowerCase()} from ${d.creator.name}? This also removes any payout logged against it.`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
