import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarTint(name: string) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return sum % 2 === 0 ? "bg-lift text-ink" : "bg-line text-paper";
}

export default async function CreatorManagerDashboard() {
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliverables: true } } },
  });

  const igReady = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  ).length;
  const needsFollowUp = creators.filter((c) => !c.handle || !c.platform).length;
  const aiSummary = `AI summary: ${igReady} creators are ready for Instagram audit, ${creators.length - igReady} still need profile cleanup, and ${needsFollowUp} profiles need follow-up before the next campaign.`;

  const roleWidgets = [
    { label: "Total creators", value: creators.length, hint: "On the current roster" },
    { label: "Instagram ready", value: igReady, hint: "Profiles ready to audit" },
    { label: "Needs follow-up", value: needsFollowUp, hint: "Missing handle or platform" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-lift" />
        <h1 className="text-xl font-display font-semibold">Creator Roster</h1>
      </div>
      <p className="text-sm text-muted mb-6">Everyone on the roster, at a glance.</p>

      <div className="card border-lift/40 bg-gradient-to-r from-lift/10 via-ink to-panel p-4 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lift mb-2">AI summary</div>
        <div className="text-sm text-paper">{aiSummary}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {roleWidgets.map((widget) => (
          <div key={widget.label} className="card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{widget.label}</div>
            <div className="text-2xl font-medium text-lift mt-2">{widget.value}</div>
            <div className="text-[11px] text-muted mt-1">{widget.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Total creators</div>
          <div className="text-2xl font-medium text-lift font-mono">{creators.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted mb-2">Ready for Instagram audit</div>
          <div className="text-2xl font-medium text-lift font-mono">{igReady}</div>
        </div>
      </div>

      <Link
        href="/insights"
        className="card p-4 mb-6 flex items-center justify-between hover:border-lift transition-colors group"
      >
        <div>
          <div className="text-sm font-medium">Run an engagement audit</div>
          <div className="text-xs text-muted">Check performance for anyone on the roster</div>
        </div>
        <ArrowRight size={16} className="text-lift group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <div className="grid grid-cols-4 gap-3">
        {creators.length === 0 && (
          <div className="col-span-4 card p-4 text-sm text-muted">
            No creators yet — add one from the Creators tab.
          </div>
        )}
        {creators.map((c) => (
          <div key={c.id} className="card p-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-semibold mb-3 ${avatarTint(c.name)}`}>
              {initials(c.name)}
            </div>
            <div className="text-sm font-medium truncate">{c.name}</div>
            <div className="text-xs text-muted mt-0.5 truncate">
              {c.handle ?? "no handle"} · {c.platform ?? "—"}
            </div>
            <div className="text-xs text-muted mt-1 font-mono">{c._count.deliverables} deliverables</div>
          </div>
        ))}
      </div>
    </div>
  );
}