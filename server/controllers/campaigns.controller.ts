import crypto from "node:crypto";
import { Types } from "mongoose";
import { Campaign } from "../models/Campaign.js";
import { Contact } from "../models/Contact.js";
import { Company } from "../models/Company.js";
import { Deal } from "../models/Deal.js";
import { EmailTracking } from "../models/EmailTracking.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { renderCampaignTemplate } from "../services/template.service.js";
import { isEmailConfigured, sendEmailMessage } from "../services/email.service.js";
import { createOrganizationNotifications } from "../services/notification.service.js";
import { recordAuditLog } from "../services/audit.service.js";
import { env } from "../config/env.js";

function buildContactFilter(segment: Record<string, unknown> | undefined, organizationId: string) {
  const filter: Record<string, unknown> = { organizationId };

  if (!segment) {
    return filter;
  }

  if (typeof segment.q === "string" && segment.q.trim()) {
    filter.$or = [
      { name: { $regex: segment.q.trim(), $options: "i" } },
      { email: { $regex: segment.q.trim(), $options: "i" } },
      { companyName: { $regex: segment.q.trim(), $options: "i" } }
    ];
  }

  if (typeof segment.companyId === "string" && Types.ObjectId.isValid(segment.companyId)) {
    filter.companyId = segment.companyId;
  }

  if (typeof segment.tag === "string" && segment.tag.trim()) {
    filter.tags = { $in: [segment.tag.trim()] };
  }

  return filter;
}

async function loadCampaignRecipients(organizationId: string, segment?: Record<string, unknown>) {
  const contacts = await Contact.find(buildContactFilter(segment, organizationId)).lean();
  const deals = await Deal.find({ organizationId }).lean();

  return contacts
    .filter((contact) => Boolean(contact.email))
    .map((contact) => {
      const deal =
        deals.find((candidate) => String(candidate.contactId ?? "") === String(contact._id)) ??
        deals.find((candidate) => String(candidate.companyId ?? "") === String(contact.companyId ?? ""));

      return {
        contact,
        deal,
        token: crypto.randomUUID()
      };
    });
}

export const listCampaigns = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const campaigns = await Campaign.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).lean();
  return sendResponse(res, 200, "Campaigns loaded successfully.", { campaigns });
});

export const createCampaign = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { name, subject, content, segment } = req.body as {
    name?: string;
    subject?: string;
    content?: string;
    segment?: Record<string, unknown>;
  };

  if (!name || !subject || !content) {
    return sendResponse(res, 400, "Name, subject, and content are required.", {});
  }

  const recipients = await loadCampaignRecipients(req.organization.id, segment);

  const campaign = await Campaign.create({
    organizationId: req.organization.id,
    name,
    subject,
    content,
    segment: segment ?? null,
    recipients: recipients.map((recipient) => ({
      contactId: recipient.contact._id,
      email: recipient.contact.email,
      name: recipient.contact.name,
      token: recipient.token
    })),
    sentCount: 0,
    openedCount: 0,
    createdBy: req.auth.userId,
    status: "draft"
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "campaign_created",
    entityType: "campaign",
    entityId: String(campaign._id),
    metadata: { recipientCount: recipients.length }
  });

  return sendResponse(res, 201, "Campaign created successfully.", { campaign, recipientCount: recipients.length });
});

export const previewCampaign = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { subject, content, contactId } = req.body as {
    subject?: string;
    content?: string;
    contactId?: string;
  };

  if (!subject || !content) {
    return sendResponse(res, 400, "Subject and content are required.", {});
  }

  const contact = contactId && Types.ObjectId.isValid(contactId)
    ? await Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean()
    : null;

  const company = contact?.companyId
    ? await Company.findOne({ _id: contact.companyId, organizationId: req.organization.id }).lean()
    : null;

  const deal = contact
    ? await Deal.findOne({ organizationId: req.organization.id, contactId: contact._id }).lean()
    : null;

  const preview = {
    subject: subject
      .replace(/\{\{firstName\}\}/g, contact?.name?.split(" ")[0] ?? "")
      .replace(/\{\{company\}\}/g, company?.name ?? contact?.companyName ?? "")
      .replace(/\{\{dealValue\}\}/g, deal ? `$${Number(deal.value ?? 0).toLocaleString()}` : "$0"),
    content: renderCampaignTemplate(content, contact ?? { name: "", companyName: "", email: "" } as never, company, deal)
  };

  return sendResponse(res, 200, "Campaign preview generated successfully.", { preview });
});

export const sendCampaign = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const campaignId = String(req.params.campaignId);
  const campaign = await Campaign.findOne({ _id: campaignId, organizationId: req.organization.id });

  if (!campaign) {
    return sendResponse(res, 404, "Campaign not found.", {});
  }

  if (!isEmailConfigured()) {
    return sendResponse(res, 503, "Email delivery is not configured.", {});
  }

  let sentCount = 0;
  const sentRecipients = [];

  for (const recipient of campaign.recipients as Array<{
    contactId: Types.ObjectId;
    email: string;
    name: string;
    token: string;
    sentAt?: Date | null;
    openedAt?: Date | null;
    lastOpenedAt?: Date | null;
    isOpened?: boolean;
  }>) {
    const contact = await Contact.findOne({ _id: recipient.contactId, organizationId: req.organization.id }).lean();
    if (!contact) {
      continue;
    }

    const company = contact.companyId
      ? await Company.findOne({ _id: contact.companyId, organizationId: req.organization.id }).lean()
      : null;
    const deal = await Deal.findOne({ organizationId: req.organization.id, contactId: contact._id }).lean();
    const personalizedSubject = renderCampaignTemplate(campaign.subject, contact, company, deal);
    const personalizedContent = renderCampaignTemplate(campaign.content, contact, company, deal);
    const trackingUrl = `${env.clientOrigin.replace(/\/$/, "")}/api/public/organizations/${req.organization.id}/campaigns/${campaign._id}/track/${recipient.token}.gif`;

    await sendEmailMessage({
      to: recipient.email,
      subject: personalizedSubject,
      text: `${personalizedContent}\n\nTrack link: ${trackingUrl}`,
      html: `${personalizedContent}<img src="${trackingUrl}" alt="" width="1" height="1" style="display:none;" />`
    });

    recipient.sentAt = new Date();
    sentCount += 1;
    sentRecipients.push(recipient.email);

    await EmailTracking.updateOne(
      {
        organizationId: req.organization.id,
        campaignId: campaign._id,
        contactId: contact._id,
        recipientToken: recipient.token
      },
      {
        $setOnInsert: {
          organizationId: req.organization.id,
          campaignId: campaign._id,
          contactId: contact._id,
          recipientToken: recipient.token
        }
      },
      { upsert: true }
    );
  }

  campaign.status = "sent";
  campaign.sentCount = sentCount;
  await campaign.save();

  await createOrganizationNotifications({
    organizationId: req.organization.id,
    type: "campaign_sent",
    title: "Bulk email campaign sent",
    message: `${campaign.name} was sent to ${sentCount} recipients.`,
    metadata: { campaignId: String(campaign._id) },
    excludeUserId: req.auth.userId
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "campaign_sent",
    entityType: "campaign",
    entityId: String(campaign._id),
    metadata: { sentCount }
  });

  return sendResponse(res, 200, "Campaign sent successfully.", { campaign, sentRecipients });
});

export const getCampaignStats = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const campaignId = String(req.params.campaignId);
  const campaign = await Campaign.findOne({ _id: campaignId, organizationId: req.organization.id }).lean();
  if (!campaign) {
    return sendResponse(res, 404, "Campaign not found.", {});
  }

  const openedCount = await EmailTracking.countDocuments({
    organizationId: req.organization.id,
    campaignId: campaign._id,
    openedAt: { $ne: null }
  });

  return sendResponse(res, 200, "Campaign stats loaded successfully.", {
    campaign,
    stats: {
      sentCount: campaign.sentCount,
      openedCount,
      openRate: campaign.sentCount ? Math.round((openedCount / campaign.sentCount) * 100) : 0
    }
  });
});

export const trackCampaignOpen = asyncHandler(async (req, res) => {
  const { orgId, campaignId, token } = req.params as { orgId?: string; campaignId?: string; token?: string };

  if (!orgId || !campaignId || !token) {
    return res.status(400).send("Invalid tracking request.");
  }

  const campaign = await Campaign.findOne({ _id: campaignId, organizationId: orgId });
  if (!campaign) {
    return res.status(404).send("Campaign not found.");
  }

  const recipient = campaign.recipients.find((item) => item.token === token);
  if (recipient) {
    const now = new Date();
    const wasOpened = recipient.isOpened;
    recipient.isOpened = true;
    recipient.openedAt = recipient.openedAt ?? now;
    recipient.lastOpenedAt = now;
    if (!wasOpened) {
      campaign.openedCount = (campaign.openedCount ?? 0) + 1;
    }
    await campaign.save();

    const contact = await Contact.findOne({ _id: recipient.contactId, organizationId: orgId }).lean();
    if (contact) {
      await EmailTracking.findOneAndUpdate(
        {
          organizationId: orgId,
          campaignId,
          contactId: contact._id,
          recipientToken: token
        },
        {
          $set: {
            openedAt: now,
            lastOpenedAt: now,
            ipAddress: String(req.ip ?? ""),
            userAgent: String(req.headers["user-agent"] ?? "")
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  const pixel = Buffer.from(
    "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64"
  );

  return res
    .status(200)
    .set({
      "Content-Type": "image/gif",
      "Content-Length": String(pixel.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    })
    .send(pixel);
});
