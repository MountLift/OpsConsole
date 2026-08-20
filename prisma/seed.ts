import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.create({
    data: {
      name: "Northfield Skincare",
      contactName: "Priya Shah",
      contactEmail: "priya@northfieldskincare.com",
    },
  });

  const creatorA = await prisma.creator.create({
    data: { name: "Maya Torres", handle: "@mayatorres", platform: "Instagram", email: "maya@example.com" },
  });
  const creatorB = await prisma.creator.create({
    data: { name: "Jonah Lee", handle: "@jonahlee", platform: "TikTok", email: "jonah@example.com" },
  });

  const campaign = await prisma.campaign.create({
    data: {
      name: "Northfield Summer Launch",
      brandId: brand.id,
      budget: 15000,
      status: "ACTIVE",
    },
  });

  const d1 = await prisma.deliverable.create({
    data: {
      campaignId: campaign.id,
      creatorId: creatorA.id,
      type: "REEL",
      agreedRate: 2500,
      status: "APPROVED",
    },
  });
  const d2 = await prisma.deliverable.create({
    data: {
      campaignId: campaign.id,
      creatorId: creatorB.id,
      type: "VIDEO",
      agreedRate: 4000,
      status: "IN_PROGRESS",
    },
  });

  await prisma.payout.create({
    data: { deliverableId: d1.id, amount: 2500, status: "APPROVED" },
  });
  await prisma.payout.create({
    data: { deliverableId: d2.id, amount: 4000, status: "PENDING" },
  });

  await prisma.invoice.create({
    data: {
      brandId: brand.id,
      campaignId: campaign.id,
      amount: 15000,
      status: "SENT",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
