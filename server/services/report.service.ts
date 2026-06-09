import { Activity } from "../models/Activity.js";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";

export type ReportEntity = "contacts" | "companies" | "deals" | "activities";

export type ReportConfiguration = {
  entity: ReportEntity;
  columns: string[];
  filters?: Record<string, unknown>;
  dateRange?: {
    from?: string;
    to?: string;
  };
};

function applyDateRange(filter: Record<string, unknown>, dateRange?: { from?: string; to?: string }) {
  if (!dateRange?.from && !dateRange?.to) {
    return;
  }

  filter.createdAt = {};
  if (dateRange.from) {
    (filter.createdAt as Record<string, unknown>).$gte = new Date(dateRange.from);
  }
  if (dateRange.to) {
    (filter.createdAt as Record<string, unknown>).$lte = new Date(dateRange.to);
  }
}

function buildFilter(entity: ReportEntity, organizationId: string, configuration: ReportConfiguration) {
  const filter: Record<string, unknown> = { organizationId };
  const filters = configuration.filters ?? {};

  if (entity === "contacts") {
    if (typeof filters.companyName === "string" && filters.companyName.trim()) {
      filter.companyName = { $regex: filters.companyName.trim(), $options: "i" };
    }
    if (typeof filters.tag === "string" && filters.tag.trim()) {
      filter.tags = { $in: [filters.tag.trim()] };
    }
  }

  if (entity === "companies") {
    if (typeof filters.industry === "string" && filters.industry.trim()) {
      filter.industry = { $regex: filters.industry.trim(), $options: "i" };
    }
  }

  if (entity === "deals") {
    if (typeof filters.stage === "string" && filters.stage.trim()) {
      filter.stage = filters.stage.trim();
    }
  }

  if (entity === "activities") {
    if (typeof filters.type === "string" && filters.type.trim()) {
      filter.type = filters.type.trim();
    }
  }

  applyDateRange(filter, configuration.dateRange);
  return filter;
}

export async function loadReportRows(
  organizationId: string,
  configuration: ReportConfiguration
): Promise<Record<string, unknown>[]> {
  const filter = buildFilter(configuration.entity, organizationId, configuration);

  switch (configuration.entity) {
    case "contacts":
      return Contact.find(filter).lean();
    case "companies":
      return Company.find(filter).lean();
    case "deals":
      return Deal.find(filter).lean();
    case "activities":
      return Activity.find(filter).lean();
    default:
      return [];
  }
}

export function pickColumns(rows: Record<string, unknown>[], columns: string[]) {
  if (!columns.length) {
    return rows;
  }

  return rows.map((row) =>
    columns.reduce<Record<string, unknown>>((acc, column) => {
      acc[column] = row[column] ?? "";
      return acc;
    }, {})
  );
}

