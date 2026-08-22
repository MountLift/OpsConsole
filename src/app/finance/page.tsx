import { prisma } from "@/lib/prisma";
import { markPayoutPaid, markInvoicePaid } from "./actions";
import { requireAccess } from "@/lib/require-access";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  await requireAccess("/finance");

  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status ?? "";

  const payoutStatusFilter =
    status === "paid" ? { status: "PAID" as const } : status === "outstanding" ? { status: { not: "PAID" as const } } : {};
  const invoiceStatusFilter =
    status === "paid" ? { status: "PAID" as const } : status === "outstanding" ? { status: { not: "PAID" as const } } : {};

  const [payouts, invoices] = await Promise.all([
    prisma.payout.findMany({
      where: {
        AND: [
          payoutStatusFilter,
          q ? { deliverable: { creator: { name: { contains: q, mode: "insensitive" } } } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { deliverable: { include: { creator: true, campaign: true } } },
    }),
    prisma.invoice.findMany({
      where: {
        AND: [
          invoiceStatusFilter,
          q ? { brand: { name: { contains: q, mode: "insensitive" } } } : {},
        ],
      },
      orderBy: { issuedAt: "desc" },
      include: { brand: true, campaign: true },
    }),
  ]);

  const totalPayable = payouts.filter((p) => p.status !== "PAID").reduce((s, p) => s + Number(p.amount), 0);
  const totalReceivable = invoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-display font-semibold">Finance</h1>
        <a href="/api/export/finance" className="text-xs text-lift hover:underline" download>
          Export CSV
        </a>
      </div>
      <p className="text-sm text-muted mb-6">Money owed to creators, and money owed by brands.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding payouts (payable)</div>
          <div className="text-2xl font-medium text-amber">{money(totalPayable)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding invoices (receivable)</div>
          <div className="text-2xl font-medium text-lift">{money(totalReceivable)}</div>
        </div>
      </div>

      <form className="card p-4 grid grid-cols-4 gap-3 mb-10" method="GET">
        <input
          className="input col-span-2"
          name="q"
          placeholder="Search creator or brand name…"
          defaultValue={q}
        />
        <select className="input" name="status" defaultValue={status}>
          <option value="">All</option>
          <option value="outstanding">Outstanding only</option>
          <option value="paid">Paid only</option>
        </select>
        <button className="btn" type="submit">Filter</button>
      </form>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Creator payouts</h2>
      <div className="card divide-y divide-line mb-10">
        {payouts.length === 0 && <div className="p-4 text-sm text-muted">No payouts match.</div>}
        {payouts.map((p) => (
          <div key={p.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{p.deliverable.creator.name}</div>
              <div className="text-muted text-xs">{p.deliverable.campaign.name} · {p.status}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono">{money(Number(p.amount))}</div>
              {p.status !== "PAID" && (
                <form action={markPayoutPaid.bind(null, p.id)}>
                  <button className="text-xs text-lift hover:underline" type="submit">
                    Mark paid
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Brand invoices</h2>
      <div className="card divide-y divide-line">
        {invoices.length === 0 && <div className="p-4 text-sm text-muted">No invoices match.</div>}
        {invoices.map((i) => (
          <div key={i.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{i.brand.name}</div>
              <div className="text-muted text-xs">{i.campaign?.name ?? "—"} · {i.status}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono">{money(Number(i.amount))}</div>
              {i.status !== "PAID" && (
                <form action={markInvoicePaid.bind(null, i.id)}>
                  <button className="text-xs text-lift hover:underline" type="submit">
                    Mark paid
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
