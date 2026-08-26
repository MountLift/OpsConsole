import Link from "next/link";
import { AlertTriangle, ArrowRight, FileSpreadsheet, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
function plural(count: number, noun: string) { return `${count} ${noun}${count === 1 ? "" : "s"}`; }

export default async function AdminDashboard() {
  const [active, campaignCount, brandCount, creatorCount, pending, invoices, payoutQueue, recentCreators] = await Promise.all([
    prisma.campaign.findMany({ where: { status: "ACTIVE" }, include: { brand: true, _count: { select: { deliverables: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.campaign.count(), prisma.brand.count(), prisma.creator.count(),
    prisma.payout.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, _count: true, where: { status: { in: ["SENT", "OVERDUE"] } } }),
    prisma.payout.findMany({ where: { status: "PENDING" }, take: 4, orderBy: { createdAt: "desc" }, include: { deliverable: { include: { creator: true, campaign: true } } } }),
    prisma.creator.findMany({ take: 4, orderBy: { createdAt: "desc" }, include: { _count: { select: { deliverables: true } } } }),
  ]);
  const payoutTotal = Number(pending._sum.amount ?? 0);
  const invoiceTotal = Number(invoices._sum.amount ?? 0);
  const activeBudget = active.reduce((sum, campaign) => sum + Number(campaign.budget), 0);
  const attention = pending._count + invoices._count;

  return <div className="space-y-7">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><p className="eyebrow">Operations</p><h1 className="text-3xl font-display font-bold tracking-tight">Today&apos;s desk</h1><p className="text-sm text-muted mt-1">{attention ? `${plural(attention, "financial item")} need attention.` : "Nothing awaiting a finance decision."}</p></div>
      <div className="flex items-center gap-2 flex-wrap"><Link href="/campaigns" className="quick-link"><Plus size={14} />Campaign</Link><Link href="/creators" className="quick-link"><Plus size={14} />Creator</Link><Link href="/api/export/finance" className="quick-link" download><FileSpreadsheet size={14} />Export</Link></div>
    </header>

    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Link href="/finance?status=outstanding" className={`lg:col-span-5 rounded-2xl p-6 border transition-colors ${payoutTotal > 0 ? "bg-amber/10 border-amber/30 hover:border-amber" : "card hover:border-lift/40"}`}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-mono uppercase tracking-wider text-muted">Creator payouts to clear</p><div className={`${payoutTotal > 0 ? "text-amber" : "text-lift"} text-4xl font-display font-semibold mt-3`}>{money(payoutTotal)}</div><p className="text-sm text-muted mt-2">{pending._count ? `${plural(pending._count, "payout")} pending` : "All creator payouts are settled"}</p></div>{payoutTotal > 0 && <AlertTriangle size={20} className="text-amber mt-1" aria-label="Action required" />}</div>
      </Link>
      <Link href="/finance?status=outstanding" className={`lg:col-span-3 card p-5 hover:border-lift/40 ${invoiceTotal > 0 ? "border-amber/30" : ""}`}><p className="text-xs font-mono uppercase tracking-wider text-muted">Client invoices open</p><div className={`${invoiceTotal > 0 ? "text-amber" : "text-lift"} text-2xl font-display font-semibold mt-3`}>{money(invoiceTotal)}</div><p className="text-xs text-muted mt-2">{invoices._count ? `${plural(invoices._count, "invoice")} awaiting payment` : "No receivables outstanding"}</p></Link>
      <Link href="/campaigns" className="lg:col-span-2 card p-5 hover:border-lift/40"><p className="text-xs text-muted">Active campaigns</p><div className="text-3xl font-display font-semibold text-lift mt-3">{active.length}</div><p className="text-xs text-muted mt-2">{plural(campaignCount, "campaign")} total</p></Link>
      <Link href="/creators" className="lg:col-span-2 card p-5 hover:border-lift/40"><p className="text-xs text-muted">Creator roster</p><div className="text-3xl font-display font-semibold text-paper mt-3">{creatorCount}</div><p className="text-xs text-muted mt-2">Across {plural(brandCount, "brand")}</p></Link>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 card overflow-hidden"><div className="px-6 pt-5 pb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-display font-semibold">Active campaigns</h2><p className="text-xs text-muted mt-1">{money(activeBudget)} currently committed</p></div><Link href="/campaigns" className="text-xs text-lift hover:underline inline-flex gap-1 items-center">View all <ArrowRight size={12} /></Link></div><div className="divide-y divide-line">{active.length === 0 ? <div className="px-6 py-10 text-sm text-muted">No active campaigns yet.</div> : active.slice(0, 5).map(c => <Link key={c.id} href={`/campaigns/${c.id}`} className="table-row flex items-center justify-between gap-4 px-6 py-4"><div><p className="font-medium text-paper">{c.name}</p><p className="text-xs text-muted mt-1">{c.brand.name} · {plural(c._count.deliverables, "deliverable")}</p></div><div className="text-right"><p className="font-mono text-sm text-lift">{money(Number(c.budget))}</p><p className="text-[10px] text-muted uppercase tracking-wide">Budget</p></div></Link>)}</div></div>
      <aside className="rounded-2xl border border-amber/25 bg-amber/5 overflow-hidden"><div className="px-5 py-4 border-b border-amber/15"><h2 className="font-display font-semibold text-paper">Payout queue</h2><p className="text-xs text-muted mt-1">Only items needing a decision.</p></div>{payoutQueue.length === 0 ? <p className="p-5 text-sm text-muted">No payouts waiting.</p> : <div className="divide-y divide-amber/10">{payoutQueue.map(p => <Link key={p.id} href="/finance?status=outstanding" className="block px-5 py-4 hover:bg-amber/5"><div className="flex justify-between gap-3"><div><p className="text-sm font-medium text-paper">{p.deliverable.creator.name}</p><p className="text-xs text-muted mt-1">{p.deliverable.campaign.name}</p></div><p className="font-mono text-sm text-amber">{money(Number(p.amount))}</p></div></Link>)}</div>}<div className="px-5 py-4 border-t border-amber/15"><Link href="/finance?status=outstanding" className="text-xs text-amber hover:underline">Review payouts →</Link></div></aside>
    </section>

    <section className="max-w-2xl"><div className="flex items-center justify-between mb-3"><h2 className="text-sm font-display font-semibold">Recently added creators</h2><Link href="/creators" className="text-xs text-lift hover:underline">Roster →</Link></div><div className="flex flex-wrap gap-x-6 gap-y-3">{recentCreators.map(creator => <div key={creator.id} className="text-sm"><span className="font-medium text-paper">{creator.name}</span><span className="text-muted font-mono text-xs ml-2">{creator.handle ? `@${creator.handle.replace(/^@/, "")}` : "no handle"} · {plural(creator._count.deliverables, "deliverable")}</span></div>)}</div></section>
  </div>;
}
