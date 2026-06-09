import { api } from "./api";
import { orgPath } from "./org";

export async function getAnalyticsDashboard() {
  const response = await api.get(orgPath("/analytics"));
  return response.data.data as {
    analytics: {
      sales: {
        totalRevenue: number;
        pipelineValue: number;
        winRate: number;
        averageDealSize: number;
        averageSalesCycle: number;
      };
      activity: {
        emailsSent: number;
        meetingsCompleted: number;
        callsLogged: number;
      };
      ai: {
        dealsScored: number;
        forecastAccuracy: number;
        aiEmailsGenerated: number;
      };
      charts: {
        revenueTrend: Array<{ month: string; revenue: number }>;
        pipelineDistribution: Array<{ stage: string; count: number; value: number }>;
        stageConversionRates: Array<{ stage: string; rate: number }>;
        teamPerformance: Array<{ label: string; value: number }>;
      };
    };
  };
}

