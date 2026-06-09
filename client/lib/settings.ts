import { api } from "./api";
import { orgPath } from "./org";

export async function getOrganizationSettings() {
  const response = await api.get(orgPath("/settings"));
  return response.data.data as {
    organization: {
      _id: string;
      name: string;
      slug: string;
      logoUrl?: string;
      timezone?: string;
      currency?: string;
      branding?: {
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
      };
    };
  };
}

export async function updateOrganizationSettings(payload: FormData) {
  const response = await api.patch(orgPath("/settings"), payload);
  return response.data.data as {
    organization: {
      _id: string;
      name: string;
    };
  };
}
