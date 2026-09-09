import Link from "next/link";
import { LockKeyhole, MessageCircle, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { campaignScope, requireContext } from "@/lib/access";
import { sendCampaignMessage } from "./actions";

export default async function MessagesPage({ searchParams }: { searchParams?: { campaign?: string } }) {
  const context = await requireContext();
  const campaigns = await prisma.campaign.findMany({
    where: campaignScope(context),
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      deliverables: { select: { creator: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const selected = campaigns.find((campaign) => campaign.id === searchParams?.campaign) ?? campaigns[0];
  const messages = selected
    ? await prisma.campaignMessage.findMany({ where: { campaignId: selected.id }, orderBy: { createdAt: "asc" } })
    : [];
  const creatorNames = selected ? Array.from(new Set(selected.deliverables.map((item) => item.creator.name))) : [];

  return (
    <div className="space-y-7 animate-fade-up">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private by design</p>
          <h1 className="font-display font-bold">Messages<span className="text-lift">.</span></h1>
          <p className="mt-2 text-sm text-muted">One quiet room per campaign. Only the assigned team can see it.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#e4efc4] px-3 py-2 text-xs font-medium text-[#61733f] w-fit">
          <LockKeyhole size={13} /> Assignment-scoped
        </div>
      </header>

      <div className="grid min-h-[520px] grid-cols-1 overflow-hidden rounded-[15px] border border-line bg-panel md:grid-cols-[290px_1fr]">
        <aside className="border-b border-line md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="eyebrow mb-0">Your rooms</p>
            <MessageCircle size={18} className="text-muted" />
          </div>
          <div className="divide-y divide-line">
            {campaigns.length === 0 ? <p className="p-5 text-sm text-muted">No assigned campaign rooms yet.</p> : campaigns.map((campaign) => {
              const active = campaign.id === selected?.id;
              const preview = campaign.messages[0]?.body ?? "No messages yet. Start the room.";
              return <Link key={campaign.id} href={`/messages?campaign=${campaign.id}`} className={`block px-5 py-4 transition-colors ${active ? "bg-[#f5e3e3] border-l-[3px] border-lift" : "hover:bg-[#fff4f6]"}`}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-paper">{campaign.brand.name} / {campaign.name}</p><p className="mt-1 truncate text-xs text-muted">{preview}</p></div>{campaign.messages.length > 0 && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lift" />}</div>
                <p className="mt-2 text-[10px] font-mono text-muted">{campaign.deliverables.length} assigned creator{campaign.deliverables.length === 1 ? "" : "s"}</p>
              </Link>;
            })}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col">
          {selected ? <>
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <div><p className="text-sm font-semibold text-paper">{selected.brand.name} / {selected.name}</p><p className="mt-1 text-xs text-muted">{creatorNames.length ? creatorNames.join(", ") : "No creator assigned yet"} · private campaign room</p></div>
              <Link href={`/campaigns/${selected.id}`} className="text-xs font-semibold text-lift hover:underline">View brief ↗</Link>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto bg-[#fcf8f3] px-5 py-6 sm:px-8">
              {messages.length === 0 ? <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><MessageCircle size={26} className="mb-3 text-lift" /><p className="text-sm font-semibold text-paper">Start the campaign room</p><p className="mt-1 max-w-xs text-xs text-muted">Share a brief note with the people assigned to this campaign.</p></div> : messages.map((message) => {
                const own = message.senderClerkId === context.clerkUserId;
                return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] ${own ? "items-end" : "items-start"} flex flex-col`}><span className="mb-1 text-[10px] font-mono text-muted">{own ? "You" : "Campaign team"}</span><div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${own ? "rounded-br-sm bg-paper text-white" : "rounded-bl-sm bg-[#f0e4db] text-paper"}`}>{message.body}</div><time className="mt-1 text-[10px] font-mono text-muted">{message.createdAt.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" })}</time></div></div>;
              })}
            </div>
            <form action={sendCampaignMessage.bind(null, selected.id)} className="flex gap-2 border-t border-line bg-panel p-4 sm:p-5"><label className="sr-only" htmlFor="message-body">Message</label><textarea id="message-body" name="body" required maxLength={2000} rows={2} placeholder="Write a note to this campaign room…" className="input min-h-12 resize-none" /><button className="btn self-end px-4" aria-label="Send message" title="Send message"><Send size={15} /></button></form>
          </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle size={28} className="mb-3 text-lift" /><p className="font-display text-xl font-semibold text-paper">No campaign rooms yet</p><p className="mt-1 text-sm text-muted">Rooms appear when a campaign is assigned to your side of the work.</p></div>}
        </section>
      </div>
    </div>
  );
}