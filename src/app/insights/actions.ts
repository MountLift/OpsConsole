"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function extractInsightMetrics(rawData: any) {
  if (!rawData || typeof rawData !== "object") {
    return {
      avgViews: null,
      medianViews: null,
      avgLikes: null,
      avgComments: null,
      engagementRate: null,
      consistencyLabel: null,
      postingFrequencyDays: null,
      viewToFollowerRatio: null,
    };
  }

  const r = rawData;

  const parseNum = (val: any): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const avgViews = parseNum(r.avgViews ?? r.avg_views ?? r.averageViews ?? r.metrics?.avgViews ?? r.metrics?.avg_views);
  const medianViews = parseNum(r.medianViews ?? r.median_views ?? r.metrics?.medianViews ?? r.metrics?.median_views);
  const avgLikes = parseNum(r.avgLikes ?? r.avg_likes ?? r.averageLikes ?? r.metrics?.avgLikes ?? r.metrics?.avg_likes);
  const avgComments = parseNum(r.avgComments ?? r.avg_comments ?? r.averageComments ?? r.metrics?.avgComments ?? r.metrics?.avg_comments);
  const engagementRate = parseNum(r.engagementRate ?? r.engagement_rate ?? r.er ?? r.metrics?.engagementRate ?? r.metrics?.engagement_rate);

  let consistencyLabel: string | null = null;
  if (r.consistencyLabel) consistencyLabel = String(r.consistencyLabel);
  else if (r.consistency_label) consistencyLabel = String(r.consistency_label);
  else if (typeof r.consistency === "object" && r.consistency?.label) consistencyLabel = String(r.consistency.label);
  else if (typeof r.consistency === "string") consistencyLabel = String(r.consistency);

  const postingFrequencyDays = parseNum(r.postingFrequencyDays ?? r.posting_frequency_days ?? r.postingFrequency ?? r.avgDaysBetweenPosts);
  const viewToFollowerRatio = parseNum(r.viewToFollowerRatio ?? r.view_to_follower_ratio ?? r.viewToFollower);

  return {
    avgViews,
    medianViews,
    avgLikes,
    avgComments,
    engagementRate,
    consistencyLabel,
    postingFrequencyDays,
    viewToFollowerRatio,
  };
}

export async function saveInsightSnapshot(handle: string, rawData: any) {
  if (!handle || !rawData) return null;

  const normalizedHandle = handle.trim().replace(/^@/, "").toLowerCase();

  const creators = await prisma.creator.findMany({
    where: {
      handle: { not: null },
    },
  });

  const creator = creators.find(
    (c) => c.handle && c.handle.trim().replace(/^@/, "").toLowerCase() === normalizedHandle
  );

  if (!creator) return null;

  const metrics = await extractInsightMetrics(rawData);

  const insight = await prisma.creatorInsight.create({
    data: {
      creatorId: creator.id,
      avgViews: metrics.avgViews,
      medianViews: metrics.medianViews,
      avgLikes: metrics.avgLikes,
      avgComments: metrics.avgComments,
      engagementRate: metrics.engagementRate,
      consistencyLabel: metrics.consistencyLabel,
      postingFrequencyDays: metrics.postingFrequencyDays,
      viewToFollowerRatio: metrics.viewToFollowerRatio,
      raw: rawData,
    },
  });

  revalidatePath("/insights");
  revalidatePath(`/creators/${creator.id}`);
  revalidatePath("/creators");

  return insight;
}
