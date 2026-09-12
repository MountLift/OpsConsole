import { prisma } from "./prisma";
import type { AccessContext } from "./access";
import { campaignScope } from "./access";

export async function getUnreadMessageCount(context: AccessContext) {
  const campaigns = await prisma.campaign.findMany({
    where: campaignScope(context),
    select: { id: true },
  });
  const campaignIds = campaigns.map((campaign) => campaign.id);
  if (!campaignIds.length) return 0;

  const [messages, reads] = await Promise.all([
    prisma.campaignMessage.findMany({
      where: { campaignId: { in: campaignIds }, senderClerkId: { not: context.clerkUserId } },
      select: { campaignId: true, createdAt: true },
    }),
    prisma.campaignMessageRead.findMany({
      where: { campaignId: { in: campaignIds }, clerkUserId: context.clerkUserId },
      select: { campaignId: true, lastReadAt: true },
    }),
  ]);
  const lastReadByCampaign = new Map(reads.map((read) => [read.campaignId, read.lastReadAt]));

  return messages.filter((message) => message.createdAt > (lastReadByCampaign.get(message.campaignId) ?? new Date(0))).length;
}