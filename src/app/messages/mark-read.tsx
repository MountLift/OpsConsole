"use client";

import { useEffect } from "react";
import { markCampaignMessagesRead } from "./actions";

export default function MarkRead({ campaignId }: { campaignId: string }) {
  useEffect(() => {
    void markCampaignMessagesRead(campaignId);
  }, [campaignId]);

  return null;
}