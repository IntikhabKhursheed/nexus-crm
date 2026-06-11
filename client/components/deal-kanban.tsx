"use client";

import { useMemo, useState } from "react";
import type { Deal, DealStage } from "@/lib/crm";
import { dealStages } from "@/lib/crm";
import { Badge } from "./ui/chrome";

type DealKanbanProps = {
  deals: Deal[];
  onStageChange: (dealId: string, nextStage: DealStage) => Promise<void>;
};

export function DealKanban({ deals, onStageChange }: DealKanbanProps) {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const dealsByStage = useMemo(() => {
    return dealStages.reduce<Record<DealStage, Deal[]>>((acc, stage) => {
      acc[stage] = deals.filter((deal) => deal.stage === stage);
      return acc;
    }, {} as Record<DealStage, Deal[]>);
  }, [deals]);

  async function handleDrop(stage: DealStage) {
    if (!draggedDealId) return;
    await onStageChange(draggedDealId, stage);
    setDraggedDealId(null);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {dealStages.map((stage) => (
          <section
            key={stage}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              void handleDrop(stage);
            }}
            className="w-80 shrink-0 rounded-[10px] border border-[#e8ecf0] bg-[#f8fafc] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--nx-brand)]" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--nx-text-secondary)]">{stage}</h3>
              </div>
              <Badge tone="slate">{dealsByStage[stage].length}</Badge>
            </div>
            <div className="space-y-3">
              {dealsByStage[stage].map((deal) => (
                <article
                  key={deal._id}
                  draggable
                  onDragStart={() => setDraggedDealId(deal._id)}
                  className="cursor-grab rounded-[8px] border border-[#e8ecf0] bg-white p-4 transition hover:border-[#c7d2fe] hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[13px] font-bold text-[var(--nx-text-primary)]">{deal.title}</h4>
                      <p className="text-sm text-[var(--nx-text-muted)]">${deal.value.toLocaleString()}</p>
                    </div>
                    <span className="rounded-[6px] bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] px-2 py-1 text-xs font-semibold text-white">
                      {deal.aiScore?.probabilityScore ?? deal.probability}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--nx-text-muted)]">{deal.notes || "No notes yet."}</p>
                </article>
              ))}
              {dealsByStage[stage].length === 0 && (
                <div className="rounded-[8px] border border-dashed border-[#e8ecf0] p-6 text-center text-sm text-[var(--nx-text-muted)]">
                  Drop a deal here
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
