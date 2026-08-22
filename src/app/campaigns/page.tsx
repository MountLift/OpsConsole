import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CampaignForm from "./campaign-form";
import DeleteButton from "@/components/delete-button";
import { deleteCampaign } from "./actions";
import { requireAccess } from "@/lib/require-access";
import { canSeeMoney } from "@/lib/roles";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const STATUSES = ["PLANNING", "ACTIVE", "COMPLETE", "CANCELLED"];

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const role = await requireAccess("/campaigns");
  const showMoney = canSeeMoney(role);

  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status ?? "";

  const [campaigns, brands] = await Promise.all([
    prisma.campaign.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { brand: { name: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        _count: { select: { deliverables: true } },
        invoices: true,
        deliverables: { include: { payouts: true } },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Campaigns</h1>
      <p className="text-sm text-muted mb-6">Every campaign, linked to its brand and deliverables.</p>

      <CampaignForm brands={brands} showBudget={showMoney} />

      <form className="card p-4 grid grid-cols-4 gap-3 mb-6" method="GET">
        <input
          className="input col-span-2"
          name="q"
          placeholder="Search campaign or brand…"
          defaultValue={q}
        />
        <select className="input" name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn" type="submit">Filter</button>
      </form>

      <div className="card divide-y divide-line">
        {campaigns.length === 0 && (
          <div className="p-4 text-sm text-muted">No campaigns match — try clearing filters.</div>
        )}
        {campaigns.map((c) => {
          const totalInvoiced = c.invoices.reduce((s, i) => s + Number(i.amount), 0);
          const totalPayouts = c.deliverables.reduce(
            (s, d) => s + d.payouts.reduce((ps, p) => ps + Number(p.amount), 0),
            0
          );
          const profit = totalInvoiced - totalPayouts;

          return (
            <div key={c.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/campaigns/${c.id}`} className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted text-xs">
                  {c.brand.name} · {c._count.deliverables} deliverables · {c.status}
                </div>
              </Link>
              <div className="flex items-center gap-6">
                {showMoney ? (
                  <div className="text-right">
                    <div className="text-lift font-mono">{money(Number(c.budget))}</div>
                    <div className={`text-xs font-mono ${profit >= 0 ? "text-muted" : "text-amber"}`}>
                      {profit >= 0 ? "+" : ""}{money(profit)} profit
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted font-mono">{c._count.deliverables} deliverables</div>
                )}
                <DeleteButton
                  onDelete={deleteCampaign.bind(null, c.id)}
                  confirmMessage={`Remove ${c.name}? This also removes its ${c._count.deliverables} deliverable${c._count.deliverables === 1 ? "" : "s"} and any payouts/invoices tied to it.`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
