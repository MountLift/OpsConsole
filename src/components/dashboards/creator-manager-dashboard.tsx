import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, ChevronRight, Clapperboard, Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireContext, creatorScope } from "@/lib/access";

const statusStyles = {
  PLANNED: "border-paper/15 bg-paper/10 text-paper", IN_PROGRESS: "border-lift/30 bg-lift/10 text-lift",
  SUBMITTED: "border-sky-300/30 bg-sky-300/10 text-sky-200", APPROVED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200", LIVE: "border-violet-300/30 bg-violet-300/10 text-violet-200",
} as const;
const statusLabels = { PLANNED: "Planned", IN_PROGRESS: "In progress", SUBMITTED: "Submitted", APPROVED: "Approved", LIVE: "Live" } as const;

function typeLabel(type: string) { return type.charAt(0) + type.slice(1).toLowerCase(); }
function dueLabel(date: Date | null) {
  if (!date) return "No due date";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(date); due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

export default async function CreatorManagerDashboard() {
  const context = await requireContext();
  const creatorWhere = creatorScope(context);
  const [creators, updates, deliverables] = await Promise.all([
    prisma.creator.findMany({ where: creatorWhere, orderBy: { createdAt: "desc" }, include: { _count: { select: { deliverables: true } }, insights: { take: 1, orderBy: { createdAt: "desc" }, select: { engagementRate: true } } } }),
    prisma.managerUpdate.findMany({ where: { targetClerkUserId: context.clerkUserId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.deliverable.findMany({ where: { creator: creatorWhere }, include: { creator: { select: { id: true, name: true } }, campaign: { select: { id: true, name: true, brand: { select: { name: true } } } } }, orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }], take: 8 }),
  ]);

  const igReady = creators.filter((c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))).length;
  const openDeliverables = deliverables.filter((d) => !["LIVE", "APPROVED"].includes(d.status)).length;
  const dueSoon = deliverables.filter((d) => d.dueDate && !["LIVE", "APPROVED"].includes(d.status) && (d.dueDate.getTime() - Date.now()) / 86_400_000 <= 7).length;

  return <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div><p className="eyebrow">My assignments</p><h1 className="text-3xl font-display font-bold tracking-tight">Creator roster</h1><p className="text-sm text-muted mt-1">{openDeliverables ? `${openDeliverables} active deliverable${openDeliverables === 1 ? "" : "s"} across your roster.` : "Keep your creators and campaign work moving."}</p></div>
      <div className="flex items-center gap-2"><Link href="/creators" className="quick-link">My creators</Link><Link href="/insights" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity"><BarChart3 size={14} />Run IG Audit</Link></div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric label="Creator roster" value={creators.length} note="Profiles assigned to you" wide />
      <Metric label="Active work" value={openDeliverables} note="Deliverables in motion" lift />
      <Metric label="Due this week" value={dueSoon} note="Needs your attention" alert={dueSoon > 0} />
      <Metric label="Instagram ready" value={igReady} note="Handles ready to audit" lift />
    </div>

    <section>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4"><div><p className="eyebrow">What needs to be made</p><h2 className="text-lg font-display font-semibold text-paper">Assigned deliverables</h2></div><Link href="/campaigns" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium w-fit">View campaigns <ArrowRight size={12} /></Link></div>
      <div className="card overflow-hidden">
        {deliverables.length === 0 ? <div className="p-8 text-center"><Clapperboard size={24} className="mx-auto text-lift mb-3" /><p className="text-sm font-medium text-paper">No deliverables assigned yet</p><p className="text-xs text-muted mt-1">Campaign work assigned to your creators will appear here.</p></div> : <div className="divide-y divide-line">{deliverables.map((d) => {
          const overdue = d.dueDate && d.dueDate.getTime() < Date.now() && !["LIVE", "APPROVED"].includes(d.status);
          return <Link key={d.id} href={`/campaigns/${d.campaign.id}`} className="group block px-4 py-4 sm:px-5 hover:bg-paper/[0.04] transition-colors"><div className="flex items-start gap-3 sm:gap-4"><div className="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-lift/10 border border-lift/20 text-lift flex items-center justify-center"><Clapperboard size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-sm font-semibold text-paper">{typeLabel(d.type)}</span><span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${statusStyles[d.status]}`}>{statusLabels[d.status]}</span></div><p className="text-xs text-muted mt-1 truncate"><span className="text-paper/80">{d.creator.name}</span><span className="mx-1.5 text-line">·</span>{d.campaign.name}<span className="mx-1.5 text-line">·</span>{d.campaign.brand.name}</p><div className={`flex items-center gap-1.5 text-[11px] font-mono mt-2 ${overdue ? "text-amber" : "text-muted"}`}><CalendarDays size={12} />{dueLabel(d.dueDate)}</div></div><ChevronRight size={16} className="text-muted mt-2 shrink-0 group-hover:text-lift group-hover:translate-x-0.5 transition-all" /></div></Link>;
        })}</div>}
        {deliverables.length > 0 && <div className="px-5 py-3 border-t border-line bg-ink/20 flex items-center gap-2 text-[11px] text-muted"><Clock3 size={13} />Showing the next {deliverables.length} assigned deliverable{deliverables.length === 1 ? "" : "s"}, ordered by due date.</div>}
      </div>
    </section>

    <Link href="/insights" className="card p-5 flex items-center justify-between bg-gradient-to-r from-panel via-ink to-panel hover:border-lift hover:-translate-y-0.5 transition-all duration-200 group"><div className="flex items-center gap-3"><div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift"><BarChart3 size={20} /></div><div><div className="text-sm font-display font-semibold text-paper group-hover:text-lift transition-colors">Run creator engagement audit</div><div className="text-xs text-muted">Analyze engagement rates, average views, and posting consistency for any creator</div></div></div><ArrowRight size={16} className="text-lift group-hover:translate-x-1 transition-transform" /></Link>

    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="card overflow-hidden xl:col-span-2"><div className="px-5 py-3 border-b border-line flex items-center justify-between"><h2 className="text-sm font-display font-semibold text-paper">Updates from admin</h2><span className="text-[10px] font-mono text-muted">PRIVATE</span></div>{updates.length === 0 ? <p className="p-5 text-sm text-muted">No updates have been assigned to you yet.</p> : <div className="divide-y divide-line">{updates.map((u) => <article key={u.id} className="px-5 py-4"><h3 className="text-sm font-medium text-paper">{u.title}</h3><p className="text-sm text-muted mt-1 whitespace-pre-wrap">{u.body}</p><time className="text-[10px] font-mono text-muted mt-2 block">{u.createdAt.toLocaleDateString()}</time></article>)}</div>}</div>
      <div className="xl:col-span-3"><div className="flex items-center justify-between mb-4"><h2 className="text-base font-display font-semibold text-paper">Roster profiles</h2><Link href="/creators" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">All {creators.length} creators <ArrowRight size={12} /></Link></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{creators.length === 0 ? <div className="col-span-full card p-6 text-center text-sm text-muted">No creators have been assigned to you yet.</div> : creators.slice(0, 6).map((c) => { const insight = c.insights[0]; return <Link key={c.id} href={`/creators/${c.id}`} className="card p-4 flex flex-col justify-between hover:border-lift/50 hover:-translate-y-0.5 transition-all"><div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-lift/10 border border-lift/20 text-lift flex items-center justify-center font-display font-bold text-xs uppercase">{c.name.charAt(0)}</div><div className="overflow-hidden"><div className="text-sm font-medium text-paper truncate">{c.name}</div><div className="text-xs text-muted font-mono truncate">{c.handle ? (c.handle.startsWith("@") ? c.handle : `@${c.handle}`) : "No handle"}</div></div></div><div className="pt-3 border-t border-line flex items-center justify-between text-xs font-mono"><span className="text-muted">{c._count.deliverables} assigned</span><span className={insight ? "text-lift" : "text-muted"}>{insight?.engagementRate != null ? `${insight.engagementRate.toFixed(1)}% ER` : insight ? "Audit saved" : "No audit"}</span></div></Link>; })}</div></div>
    </div>
  </div>;
}

function Metric({ label, value, note, lift, alert, wide }: { label: string; value: number; note: string; lift?: boolean; alert?: boolean; wide?: boolean }) {
  return <div className={`${alert ? "border-amber/30 bg-amber/10" : "card"} ${wide ? "col-span-2 lg:col-span-1" : ""} p-5 rounded-2xl border`}><div className="text-xs text-muted font-medium mb-1">{label}</div><div className={`font-display font-semibold ${wide ? "text-4xl" : "text-2xl"} ${alert ? "text-amber" : lift ? "text-lift" : "text-paper"}`}>{value}</div><div className="text-[11px] text-muted mt-1">{note}</div></div>;
}
