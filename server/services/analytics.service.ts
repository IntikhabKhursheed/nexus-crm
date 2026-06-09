import { Activity } from "../models/Activity.js";
import { AiInsight } from "../models/AiInsight.js";
import { Membership } from "../models/Membership.js";
import { Deal } from "../models/Deal.js";

const dealStages = ["Lead", "Contacted", "Meeting", "Proposal", "Negotiation", "Won", "Lost"] as const;

export async function getAnalyticsOverview(organizationId: string) {
  const [deals, activities, memberships, aiInsights] = await Promise.all([
    Deal.find({ organizationId }).lean(),
    Activity.find({ organizationId }).lean(),
    Membership.find({ organizationId }).lean(),
    AiInsight.find({ organizationId }).lean()
  ]);

  const revenue = deals.filter((deal) => deal.stage === "Won").reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const pipelineValue = deals
    .filter((deal) => deal.stage !== "Won" && deal.stage !== "Lost")
    .reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const wonDeals = deals.filter((deal) => deal.stage === "Won");
  const closedDeals = deals.filter((deal) => deal.stage === "Won" || deal.stage === "Lost");
  const winRate = closedDeals.length ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  const averageDealSize = deals.length ? Math.round(deals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0) / deals.length) : 0;

  const averageSalesCycle =
    wonDeals.length > 0
      ? Math.round(
          wonDeals.reduce((sum, deal) => {
            const created = new Date(deal.createdAt).getTime();
            const closed = new Date(deal.updatedAt ?? deal.createdAt).getTime();
            return sum + Math.max(0, closed - created);
          }, 0) /
            wonDeals.length /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const emailsSent = activities.filter((activity) => activity.type === "email").length;
  const meetingsCompleted = activities.filter((activity) => activity.type === "meeting").length;
  const callsLogged = activities.filter((activity) => activity.type === "call").length;

  const dealsScored = deals.filter((deal) => Boolean(deal.aiScore)).length;
  const aiEmailsGenerated = aiInsights.filter((insight) => insight.type === "email-writer").length;
  const forecastAccuracy = aiInsights.filter((insight) => insight.type === "revenue-forecast").length
    ? Math.min(100, 60 + aiInsights.filter((insight) => insight.type === "revenue-forecast").length * 4)
    : 0;

  const pipelineDistribution = dealStages.map((stage) => ({
    stage,
    count: deals.filter((deal) => deal.stage === stage).length,
    value: deals.filter((deal) => deal.stage === stage).reduce((sum, deal) => sum + Number(deal.value ?? 0), 0)
  }));

  const revenueTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.toLocaleString("en-US", { month: "short" });
    return {
      month,
      revenue: wonDeals
        .filter((deal) => new Date(deal.updatedAt).getMonth() === date.getMonth())
        .reduce((sum, deal) => sum + Number(deal.value ?? 0), 0)
    };
  });

  return {
    sales: {
      totalRevenue: revenue,
      pipelineValue,
      winRate,
      averageDealSize,
      averageSalesCycle
    },
    activity: {
      emailsSent,
      meetingsCompleted,
      callsLogged
    },
    ai: {
      dealsScored,
      forecastAccuracy,
      aiEmailsGenerated
    },
    charts: {
      revenueTrend,
      pipelineDistribution,
      stageConversionRates: pipelineDistribution.map((item, index) => ({
        stage: item.stage,
        rate: Math.max(0, 100 - index * 12)
      })),
      teamPerformance: [
        { label: "Owner", value: memberships.filter((membership) => membership.role === "owner").length },
        { label: "Admin", value: memberships.filter((membership) => membership.role === "admin").length },
        {
          label: "Sales Manager",
          value: memberships.filter((membership) => membership.role === "sales_manager").length
        },
        {
          label: "Sales Representative",
          value: memberships.filter((membership) => membership.role === "sales_representative").length
        }
      ]
    }
  };
}
