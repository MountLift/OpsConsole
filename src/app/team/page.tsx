import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/require-access";
import { assignBrand, assignCreator, publishUpdate, removeBrandAssignment, removeCreatorAssignment } from "./actions";

export default async function TeamAccessPage() {
  await requireAccess("/team");
  const [creators, brands, creatorAssignments, brandAssignments] = await Promise.all([
    prisma.creator.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.creatorManagerAssignment.findMany({ include: { creator: true }, orderBy: { createdAt: "desc" } }),
    prisma.accountManagerAssignment.findMany({ include: { brand: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return <div className="space-y-8">
    <div><h1 className="text-2xl font-display font-bold tracking-tight">Team & Access</h1><p className="text-sm text-muted mt-1">Assign the exact records each manager can access. Use the user&apos;s Clerk user ID from the Clerk dashboard.</p></div>
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card p-5 space-y-4"><div><h2 className="font-display font-semibold">Creator Manager access</h2><p className="text-xs text-muted mt-1">Assigned managers can see only these creator profiles and their updates.</p></div>
        <form action={assignCreator} className="grid gap-3"><input required name="clerkUserId" className="input" placeholder="Creator Manager Clerk user ID" /><select required name="creatorId" className="input"><option value="">Choose creator…</option>{creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn w-fit">Assign creator</button></form>
        <div className="divide-y divide-line">{creatorAssignments.map(a => <div key={a.id} className="py-2 flex justify-between gap-3 text-sm"><span><b>{a.creator.name}</b><span className="block text-xs text-muted font-mono">{a.clerkUserId}</span></span><form action={removeCreatorAssignment.bind(null, a.id)}><button className="text-xs text-amber">Remove</button></form></div>)}</div>
      </section>
      <section className="card p-5 space-y-4"><div><h2 className="font-display font-semibold">Account Manager access</h2><p className="text-xs text-muted mt-1">Assigned managers can see only these brand accounts and their campaigns.</p></div>
        <form action={assignBrand} className="grid gap-3"><input required name="clerkUserId" className="input" placeholder="Account Manager Clerk user ID" /><select required name="brandId" className="input"><option value="">Choose brand…</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><button className="btn w-fit">Assign brand</button></form>
        <div className="divide-y divide-line">{brandAssignments.map(a => <div key={a.id} className="py-2 flex justify-between gap-3 text-sm"><span><b>{a.brand.name}</b><span className="block text-xs text-muted font-mono">{a.clerkUserId}</span></span><form action={removeBrandAssignment.bind(null, a.id)}><button className="text-xs text-amber">Remove</button></form></div>)}</div>
      </section>
    </div>
    <section className="card p-5 max-w-2xl"><h2 className="font-display font-semibold">Send a private manager update</h2><p className="text-xs text-muted mt-1 mb-4">The update appears only on that Creator Manager&apos;s dashboard.</p><form action={publishUpdate} className="grid gap-3"><input required name="targetClerkUserId" className="input" placeholder="Creator Manager Clerk user ID" /><input required name="title" className="input" placeholder="Update title" /><textarea required name="body" className="input min-h-28" placeholder="Brief, instruction, or note…" /><button className="btn w-fit">Publish update</button></form></section>
  </div>;
}
