import { prisma } from "@/lib/prisma";
import { getRole } from "@/lib/get-role";
import { canSeeMoney } from "@/lib/roles";
import { redirect } from "next/navigation";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function DashboardPage() {
  const role = await getRole();
  if (!role) redirect("/pending-access");
  const showMoney = canSeeMoney(role);
  const showCampaigns = role === "ADMIN" || role === "ACCOUNT_MANAGER";

  const [campaigns, payoutsPending, invoicesOutstanding, activeCreators, recentCreators] = await Promise.all([
    showCampaigns
      ? prisma.campaign.findMany({ where: { status: "ACTIVE" }, include: { brand: true } })
      : Promise.resolve([]),
    showMoney
      ? prisma.payout.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } })
      : Promise.resolve({ _sum: { amount: null } }),
    showMoney
      ? prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: { in: ["SENT", "OVERDUE"] } } })
      : Promise.resolve({ _sum: { amount: null } }),
    prisma.creator.count(),
    role === "CREATOR_MANAGER"
      ? prisma.creator.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
      : Promise.resolve([]),
  ]);

  const stats = [
    ...(showCampaigns ? [{ label: "Active campaigns", value: campaigns.length }] : []),
    { label: "Creators on roster", value: activeCreators },
    ...(showMoney
      ? [
          { label: "Payouts pending", value: money(Number(payoutsPending._sum.amount ?? 0)) },
          { label: "Invoices outstanding", value: money(Number(invoicesOutstanding._sum.amount ?? 0)) },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-8">Snapshot across every active campaign.</p>

      <div className={`grid gap-4 mb-10 ${stats.length === 4 ? "grid-cols-4" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-muted mb-2">{s.label}</div>
            <div className="text-2xl font-medium text-lift">{s.value}</div>
          </div>
        ))}
      </div>

      {showCampaigns && (
        <>
          <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Active campaigns</h2>
          <div className="card divide-y divide-line">
            {campaigns.length === 0 && (
              <div className="p-4 text-sm text-muted">No active campaigns yet.</div>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted text-xs">{c.brand.name}</div>
                </div>
                {showMoney && <div className="text-lift font-mono">{money(Number(c.budget))}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {role === "CREATOR_MANAGER" && (
        <>
          <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Recent creators</h2>
          <div className="card divide-y divide-line">
            {recentCreators.length === 0 && (
              <div className="p-4 text-sm text-muted">No creators yet.</div>
            )}
            {recentCreators.map((c) => (
              <div key={c.id} className="table-row px-4 py-3 text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted text-xs">{c.handle ?? "—"} · {c.platform ?? "no platform set"}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
