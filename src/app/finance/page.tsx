import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markPayoutPaid, markInvoicePaid } from "./actions";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const statusFilter = searchParams?.status?.trim() ?? "";

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

  const filteredPayouts = payouts.filter((p) => {
    const matchesQuery = query
      ? p.deliverable.creator.name.toLowerCase().includes(query.toLowerCase()) ||
        p.deliverable.campaign.name.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "OUTSTANDING"
        ? p.status !== "PAID"
        : statusFilter === "PAID"
        ? p.status === "PAID"
        : true;

    return matchesQuery && matchesStatus;
  });

  const filteredInvoices = invoices.filter((i) => {
    const matchesQuery = query
      ? i.brand.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.campaign?.name ?? "").toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "OUTSTANDING"
        ? i.status !== "PAID"
        : statusFilter === "PAID"
        ? i.status === "PAID"
        : true;

    return matchesQuery && matchesStatus;
  });

  const hasFilter = Boolean(query || statusFilter);
  const exportUrl = `/api/export/finance${hasFilter ? `?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusFilter)}` : ""}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium">Finance</h1>
        <a
          href={exportUrl}
          className="text-xs text-lift hover:underline"
          download
        >
          Export CSV
        </a>
      </div>
      <p className="text-sm text-muted mb-6">Money owed to creators, and money owed by brands.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding payouts (payable)</div>
          <div className="text-2xl font-medium text-amber">{money(totalPayable)}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Outstanding invoices (receivable)</div>
          <div className="text-2xl font-medium text-lift">{money(totalReceivable)}</div>
        </div>
      </div>

      <form method="GET" className="flex items-center gap-3 mb-8">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search creator, brand, or campaign…"
          className="input flex-1"
        />
        <select name="status" defaultValue={statusFilter} className="input">
          <option value="">All statuses</option>
          <option value="OUTSTANDING">Outstanding</option>
          <option value="PAID">Paid</option>
        </select>
        <button type="submit" className="btn">
          Filter
        </button>
        {hasFilter && (
          <Link href="/finance" className="text-xs text-muted hover:text-amber">
            Clear
          </Link>
        )}
      </form>

      <h2 className="text-sm font-medium mb-3 text-muted uppercase tracking-wide">Creator payouts</h2>
      <div className="card divide-y divide-line mb-10">
        {filteredPayouts.length === 0 && (
          <div className="p-4 text-sm text-muted">
            {hasFilter ? "No payouts match your filter criteria." : "No payouts logged yet."}
          </div>
        )}
        {filteredPayouts.map((p) => (
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
        {filteredInvoices.length === 0 && (
          <div className="p-4 text-sm text-muted">
            {hasFilter ? "No invoices match your filter criteria." : "No invoices logged yet."}
          </div>
        )}
        {filteredInvoices.map((i) => (
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
