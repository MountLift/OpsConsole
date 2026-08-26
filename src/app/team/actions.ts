"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import type { Role } from "@/lib/roles";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

const roles: Role[] = ["ADMIN", "ACCOUNT_MANAGER", "CREATOR_MANAGER"];

async function userHasRole(clerkUserId: string, expected: Role) {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  return user.publicMetadata?.role === expected;
}

export async function setTeamRole(clerkUserId: string, formData: FormData) {
  const current = await requireAdmin();
  const role = value(formData, "role") as Role;
  if (!roles.includes(role) || current.clerkUserId === clerkUserId) return;
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { ...user.publicMetadata, role },
  });
  revalidatePath("/team");
}

export async function assignCreator(formData: FormData) {
  await requireAdmin();
  const clerkUserId = value(formData, "clerkUserId");
  const creatorId = value(formData, "creatorId");
  if (!clerkUserId || !creatorId) return;
  if (!(await userHasRole(clerkUserId, "CREATOR_MANAGER"))) return;
  await prisma.creatorManagerAssignment.upsert({
    where: { clerkUserId_creatorId: { clerkUserId, creatorId } },
    create: { clerkUserId, creatorId }, update: {},
  });
  revalidatePath("/team"); revalidatePath("/creators"); revalidatePath("/");
}

export async function assignBrand(formData: FormData) {
  await requireAdmin();
  const clerkUserId = value(formData, "clerkUserId");
  const brandId = value(formData, "brandId");
  if (!clerkUserId || !brandId) return;
  if (!(await userHasRole(clerkUserId, "ACCOUNT_MANAGER"))) return;
  await prisma.accountManagerAssignment.upsert({
    where: { clerkUserId_brandId: { clerkUserId, brandId } },
    create: { clerkUserId, brandId }, update: {},
  });
  revalidatePath("/team"); revalidatePath("/brands"); revalidatePath("/campaigns"); revalidatePath("/");
}

export async function publishUpdate(formData: FormData) {
  const { clerkUserId } = await requireAdmin();
  const targetClerkUserId = value(formData, "targetClerkUserId");
  const title = value(formData, "title");
  const body = value(formData, "body");
  if (!targetClerkUserId || !title || !body) return;
  if (!(await userHasRole(targetClerkUserId, "CREATOR_MANAGER"))) return;
  await prisma.managerUpdate.create({ data: { targetClerkUserId, title, body, createdByClerkId: clerkUserId } });
  revalidatePath("/team"); revalidatePath("/");
}

export async function removeCreatorAssignment(id: string) {
  await requireAdmin();
  await prisma.creatorManagerAssignment.delete({ where: { id } });
  revalidatePath("/team"); revalidatePath("/creators"); revalidatePath("/");
}

export async function removeBrandAssignment(id: string) {
  await requireAdmin();
  await prisma.accountManagerAssignment.delete({ where: { id } });
  revalidatePath("/team"); revalidatePath("/brands"); revalidatePath("/campaigns"); revalidatePath("/");
}
