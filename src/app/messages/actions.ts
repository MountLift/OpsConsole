"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { campaignScope, requireContext } from "@/lib/access";

export async function sendCampaignMessage(campaignId: string, formData: FormData) {
  const context = await requireContext();
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 2000) return;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ...campaignScope(context) },
    select: { id: true },
  });
  if (!campaign) return;

  await prisma.campaignMessage.create({
    data: { campaignId: campaign.id, senderClerkId: context.clerkUserId, body },
  });

  revalidatePath("/messages");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function markCampaignMessagesRead(campaignId: string) {
  const context = await requireContext();
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ...campaignScope(context) },
    select: { id: true },
  });
  if (!campaign) return;

  await prisma.campaignMessageRead.upsert({
    where: { campaignId_clerkUserId: { campaignId: campaign.id, clerkUserId: context.clerkUserId } },
    create: { campaignId: campaign.id, clerkUserId: context.clerkUserId },
    update: { lastReadAt: new Date() },
  });

  revalidatePath("/messages");
  revalidatePath("/", "layout");
}