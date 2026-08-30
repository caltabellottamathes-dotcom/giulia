import React from "react";
import RenewOverviewCard from "@/life/components/finance/RenewOverviewCard";
import WalletBarChartWidget from "@/life/components/finance/WalletBarChartWidget";
import FinanceHealthCard from "@/life/components/finance/FinanceHealthCard";
import NewDocumentsCard from "@/life/components/finance/NewDocumentsCard";
import WalletTreemapBar from "@/life/components/finance/WalletTreemapBar";

/** FinanceOverviewWidgets — de Life-Admin Overview-bento (financiële
 *  widgets) overgenomen in het projectdetail. Elke widget laadt zijn eigen
 *  data, dus dit is puur de layout. Vervangt de project-Overview kaarten. */
export default function FinanceOverviewWidgets() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-[1.2] min-h-0 flex gap-4">
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
          <RenewOverviewCard />
        </div>
        <div className="h-full aspect-[3/2] shrink-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
          <WalletBarChartWidget />
        </div>
      </div>
      <div className="flex-[1.5] flex gap-4 min-h-0">
        <div className="h-full aspect-square shrink-0 overflow-hidden rounded-[20px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
          <FinanceHealthCard />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.3)" }}>
          <NewDocumentsCard />
        </div>
      </div>
      <div className="flex-[0.5] min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-14px 14px 36px -16px rgba(0,0,0,0.32)" }}>
        <WalletTreemapBar />
      </div>
    </div>
  );
}