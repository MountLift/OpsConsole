"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access";
import { revalidatePath } from "next/cache";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function assignCreator(formData: FormData) {
  await requireAdmin();
  const clerkUserId = value(formData, "clerkUserId");
  const creatorId = value(formData, "creatorId");
  if (!clerkUserId || !creatorId) return;
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
