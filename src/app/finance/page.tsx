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
    <div className="space-y-8">
      {/* Header & Export Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Finance</h1>
          <p className="text-sm text-muted">Ledgers for creator payouts (payable) and brand invoices (receivable).</p>
        </div>

        <a
          href={exportUrl}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity w-fit"
          download
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </a>
      </div>

      {/* Outstanding Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted font-medium">Outstanding Creator Payouts (Payable)</span>
            <span className="p-2 rounded-lg bg-amber/10 border border-amber/20 text-amber">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-display font-semibold text-amber">{money(totalPayable)}</div>
          <p className="text-xs text-muted mt-1">Owed to creators across active campaigns</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted font-medium">Outstanding Brand Invoices (Receivable)</span>
            <span className="p-2 rounded-lg bg-lift/10 border border-lift/20 text-lift">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-display font-semibold text-lift">{money(totalReceivable)}</div>
          <p className="text-xs text-muted mt-1">Owed by client brands to agency</p>
        </div>
      </div>

      {/* Filter Form */}
      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search creator, brand, or campaign…"
            className="input pl-9"
          />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select name="status" defaultValue={statusFilter} className="input w-48">
          <option value="">All Statuses</option>
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

      {/* Creator Payouts Ledger */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
          <span>Creator Payouts (Payables)</span>
          <span>{filteredPayouts.length} entries</span>
        </h2>
        <div className="card divide-y divide-line overflow-hidden">
          {filteredPayouts.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              {hasFilter ? "No payouts match your filter criteria." : "No payouts logged yet."}
            </div>
          ) : (
            filteredPayouts.map((p) => (
              <div key={p.id} className="table-row flex items-center justify-between px-5 py-3.5 text-sm group">
                <div>
                  <div className="font-medium text-paper">{p.deliverable.creator.name}</div>
                  <div className="text-muted text-xs flex items-center gap-2 mt-0.5 font-mono">
                    <span>Campaign: {p.deliverable.campaign.name}</span>
                    <span>•</span>
                    <span className={p.status === "PAID" ? "text-lift" : "text-amber"}>{p.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-paper font-medium">{money(Number(p.amount))}</div>
                  {p.status !== "PAID" ? (
                    <form action={markPayoutPaid.bind(null, p.id)}>
                      <button className="text-xs font-medium text-lift hover:underline bg-lift/10 border border-lift/20 px-2.5 py-1 rounded" type="submit">
                        Mark Paid
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs font-mono text-lift px-2.5 py-1 bg-lift/10 rounded">✓ Paid</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Brand Invoices Ledger */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
          <span>Brand Invoices (Receivables)</span>
          <span>{filteredInvoices.length} entries</span>
        </h2>
        <div className="card divide-y divide-line overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              {hasFilter ? "No invoices match your filter criteria." : "No invoices logged yet."}
            </div>
          ) : (
            filteredInvoices.map((i) => (
              <div key={i.id} className="table-row flex items-center justify-between px-5 py-3.5 text-sm group">
                <div>
                  <div className="font-medium text-paper">{i.brand.name}</div>
                  <div className="text-muted text-xs flex items-center gap-2 mt-0.5 font-mono">
                    <span>Campaign: {i.campaign?.name ?? "—"}</span>
                    <span>•</span>
                    <span className={i.status === "PAID" ? "text-lift" : "text-amber"}>{i.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-paper font-medium">{money(Number(i.amount))}</div>
                  {i.status !== "PAID" ? (
                    <form action={markInvoicePaid.bind(null, i.id)}>
                      <button className="text-xs font-medium text-lift hover:underline bg-lift/10 border border-lift/20 px-2.5 py-1 rounded" type="submit">
                        Mark Paid
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs font-mono text-lift px-2.5 py-1 bg-lift/10 rounded">✓ Paid</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
