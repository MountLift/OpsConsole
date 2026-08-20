import { prisma } from "@/lib/prisma";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function DashboardPage() {
  const [campaigns, payoutsPending, invoicesOutstanding, activeCreators] = await Promise.all([
    prisma.campaign.findMany({ where: { status: "ACTIVE" }, include: { brand: true } }),
    prisma.payout.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: { in: ["SENT", "OVERDUE"] } } }),
    prisma.creator.count(),
  ]);

  const stats = [
    { label: "Active campaigns", value: campaigns.length },
    { label: "Creators on roster", value: activeCreators },
    { label: "Payouts pending", value: money(Number(payoutsPending._sum.amount ?? 0)) },
    { label: "Invoices outstanding", value: money(Number(invoicesOutstanding._sum.amount ?? 0)) },
  ];

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-8">Snapshot across every active campaign.</p>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-muted mb-2">{s.label}</div>
            <div className="text-2xl font-medium text-lift">{s.value}</div>
          </div>
        ))}
      </div>

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
            <div className="text-lift font-mono">{money(Number(c.budget))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
