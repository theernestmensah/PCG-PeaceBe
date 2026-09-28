"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/content";

const money = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function HarvestProgress({ campaign }: { campaign: Campaign }) {
  const [confirmed, setConfirmed] = useState(Number(campaign.confirmed_amount));
  const target = Number(campaign.target_amount);
  const percent = useMemo(() => target > 0 ? Math.min(100, Math.max(0, confirmed / target * 100)) : 0, [confirmed, target]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`public-campaign-${campaign.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "campaigns", filter: `id=eq.${campaign.id}` },
        (payload) => {
          const amount = Number(payload.new.confirmed_amount);
          if (Number.isFinite(amount)) setConfirmed(amount);
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [campaign.id]);

  return (
    <div className="harvest-progress" aria-label={`${Math.round(percent)}% of Harvest target reached`}>
      <div className="harvest-progress-heading">
        <div><span>Confirmed</span><strong>{money.format(confirmed)}</strong></div>
        <div className="harvest-target"><span>Target</span><strong>{money.format(target)}</strong></div>
      </div>
      <div className="harvest-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
      <p><strong>{Math.round(percent)}%</strong> of the target reached · updates automatically after confirmation</p>
    </div>
  );
}

