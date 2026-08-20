import { prisma } from "@/lib/prisma";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function FinancePage() {
  const [payouts, invoices] = await Promise.all([
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: { deliverable: { include: { creator: true, campaign: true } } },
    }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      include: { brand: true, campaign: true },
    }),
  ]);

  const totalPayable = payouts.filter((p) => p.status !== "PAID").reduce((s, p) => s + Number(p.amount), 0);
  const totalReceivable = invoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Finance</h1>
      <p className="text-sm text-muted mb-6">Money owed to creators, and money owed by brands.</p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding payouts (payable)</div>
          <div className="text-2xl font-medium text-amber">{money(totalPayable)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding invoices (receivable)</div>
          <div className="text-2xl font-medium text-lift">{money(totalReceivable)}</div>
        </div>
      </div>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Creator payouts</h2>
      <div className="card divide-y divide-line mb-10">
        {payouts.length === 0 && <div className="p-4 text-sm text-muted">No payouts logged yet.</div>}
        {payouts.map((p) => (
          <div key={p.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{p.deliverable.creator.name}</div>
              <div className="text-muted text-xs">{p.deliverable.campaign.name} · {p.status}</div>
            </div>
            <div className="font-mono">{money(Number(p.amount))}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Brand invoices</h2>
      <div className="card divide-y divide-line">
        {invoices.length === 0 && <div className="p-4 text-sm text-muted">No invoices logged yet.</div>}
        {invoices.map((i) => (
          <div key={i.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{i.brand.name}</div>
              <div className="text-muted text-xs">{i.campaign?.name ?? "—"} · {i.status}</div>
            </div>
            <div className="font-mono">{money(Number(i.amount))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
