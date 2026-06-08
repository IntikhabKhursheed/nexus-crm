"use client";

import { useMemo, useState } from "react";
import type { Deal, DealStage } from "@/lib/crm";
import { dealStages } from "@/lib/crm";

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
            className="glass-card w-80 shrink-0 rounded-3xl p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{stage}</h3>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-slate-500">
                {dealsByStage[stage].length}
              </span>
            </div>
            <div className="space-y-3">
              {dealsByStage[stage].map((deal) => (
                <article
                  key={deal._id}
                  draggable
                  onDragStart={() => setDraggedDealId(deal._id)}
                  className="cursor-grab rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{deal.title}</h4>
                      <p className="text-sm text-slate-500">${deal.value.toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-slate-500">
                      {deal.aiScore?.probabilityScore ?? deal.probability}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{deal.notes || "No notes yet."}</p>
                </article>
              ))}
              {dealsByStage[stage].length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-slate-500">
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
