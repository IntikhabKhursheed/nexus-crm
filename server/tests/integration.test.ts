import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { createTestContext, closeTestContext } from "./test-context.js";

let context: Awaited<ReturnType<typeof createTestContext>> | undefined;

before(async () => {
  context = await createTestContext();
});

after(async () => {
  if (context) {
    await closeTestContext(context);
  }
});

async function requestJson(path: string, options: RequestInit = {}) {
  if (!context) {
    throw new Error("Test context has not been initialized.");
  }

  const response = await fetch(`${context.baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as { success?: boolean; message?: string; data?: unknown; stack?: string }) : {};
  return { response, json };
}

async function registerUser(name: string, email: string, organizationName: string) {
  if (!context) {
    throw new Error("Test context has not been initialized.");
  }

  const { response, json } = await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password: "Password123!",
      organizationName
    })
  });

  assert.equal(response.status, 201);
  assert.equal(json.success, true);

  return json.data as {
    accessToken: string;
    refreshToken: string;
    organization: { id: string; name: string };
    user: { id: string; email: string };
  };
}

describe("NexusCRM Phase 5 smoke coverage", () => {
  test("auth flow registers, logs in, and loads the current profile", async () => {
    const registration = await registerUser("Alice Example", "alice@example.com", "Alpha Org");

    const login = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "alice@example.com",
        password: "Password123!"
      })
    });

    assert.equal(login.response.status, 200);
    assert.equal(login.json.success, true);

    const me = await requestJson("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${(login.json.data as { accessToken: string }).accessToken}`
      }
    });

    assert.equal(me.response.status, 200);
    assert.equal(me.json.success, true);
    assert.equal((me.json.data as { user: { email: string } }).user.email, "alice@example.com");
    assert.equal(registration.organization.name, "Alpha Org");
  });

  test("organization data stays isolated between tenants", async () => {
    if (!context) {
      throw new Error("Test context has not been initialized.");
    }

    const alpha = await registerUser("Alpha Owner", "alpha-owner@example.com", "Alpha Org");
    const beta = await registerUser("Beta Owner", "beta-owner@example.com", "Beta Org");

    await context.Contact.create({
      organizationId: alpha.organization.id,
      name: "Alpha Contact",
      email: "contact@alpha.test",
      phone: "",
      linkedin: "",
      role: "",
      tags: [],
      companyId: null,
      companyName: "",
      notes: ""
    });

    const alphaContacts = await requestJson(`/api/organizations/${alpha.organization.id}/contacts`, {
      headers: {
        Authorization: `Bearer ${alpha.accessToken}`
      }
    });

    assert.equal(alphaContacts.response.status, 200);
    assert.equal((alphaContacts.json.data as { contacts: unknown[] }).contacts.length, 1);

    const betaContacts = await requestJson(`/api/organizations/${alpha.organization.id}/contacts`, {
      headers: {
        Authorization: `Bearer ${beta.accessToken}`
      }
    });

    assert.equal(betaContacts.response.status, 403);
    assert.match(betaContacts.json.message ?? "", /do not belong/i);
  });

  test("RBAC blocks non-admin users from team management", async () => {
    if (!context) {
      throw new Error("Test context has not been initialized.");
    }

    const owner = await registerUser("Owner User", "owner@example.com", "Owner Org");
    const orgId = owner.organization.id;

    const salesRepUser = await context.User.create({
      name: "Sales Rep",
      email: "rep@example.com",
      passwordHash: "hashed-password",
      role: "sales_representative"
    });

    await context.Membership.create({
      userId: salesRepUser._id,
      organizationId: orgId,
      role: "sales_representative",
      status: "active"
    });

    const repToken = context.signAccessToken({
      userId: String(salesRepUser._id),
      email: salesRepUser.email
    });

    const teamResponse = await requestJson(`/api/organizations/${orgId}/team`, {
      headers: {
        Authorization: `Bearer ${repToken}`
      }
    });

    assert.equal(teamResponse.response.status, 403);
    assert.match(teamResponse.json.message ?? "", /permission/i);
  });

  test("AI routes reject empty enrichment requests before any provider call", async () => {
    if (!context) {
      throw new Error("Test context has not been initialized.");
    }

    const owner = await registerUser("AI Owner", "ai-owner@example.com", "AI Org");

    const response = await requestJson(`/api/organizations/${owner.organization.id}/ai/contact-enrichment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${owner.accessToken}`
      },
      body: JSON.stringify({})
    });

    assert.equal(response.response.status, 400);
    assert.match(response.json.message ?? "", /Provide at least one/i);
  });

  test("helmet security headers are present on health checks", async () => {
    if (!context) {
      throw new Error("Test context has not been initialized.");
    }

    const response = await fetch(`${context.baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-dns-prefetch-control"));
    assert.ok(response.headers.get("x-frame-options"));
  });
});
