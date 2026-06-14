"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganizationId } from "@/lib/cms/site-context";
import { resolveOrganizationWriteTarget } from "@/features/organizations/server";
import {
  assertSupabaseWrite,
  getSupabaseServerClient,
  getSupabaseServerClientOrThrow,
} from "@/lib/supabase/server";

const defaultSettings = {
  site_name: "Halden Birøkterlag",
  logo: "",
  contact_email: "kontakt@example.no",
  phone: "+47 00 00 00 00",
  address: "Eksempelveien 1, 1776 Halden",
  facebook_url: "",
  instagram_url: "",
  footer_tagline: "",
  hero_bg_color: "#0f172a",
  hero_text_color: "#ffffff",
  hero_muted_text_color: "#cbd5e1",
  homepage_card_1_title: "",
  homepage_card_1_body: "",
  homepage_card_2_title: "",
  homepage_card_2_body: "",
  homepage_card_3_title: "",
  homepage_card_3_body: "",
};

export async function getPublicSettings() {
  const client = getSupabaseServerClient();
  const organizationId = await getCurrentOrganizationId();

  if (!client) {
    return defaultSettings;
  }

  const { data } = await client
    .from("settings")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_public", true);

  if (!data?.length) {
    return defaultSettings;
  }

  return data.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = typeof item.value === "string" ? item.value : "";
    return acc;
  }, {});
}

export async function getAdminSettings() {
  return getPublicSettings();
}

export async function saveSettings(formData: FormData) {
  const client = getSupabaseServerClientOrThrow();
  const { organizationId, siteKey } = await resolveOrganizationWriteTarget(
    String(formData.get("organization_id") || ""),
  );
  const entries = [
    "site_name",
    "logo",
    "contact_email",
    "phone",
    "address",
    "facebook_url",
    "instagram_url",
    "footer_tagline",
    "hero_bg_color",
    "hero_text_color",
    "hero_muted_text_color",
    "homepage_card_1_title",
    "homepage_card_1_body",
    "homepage_card_2_title",
    "homepage_card_2_body",
    "homepage_card_3_title",
    "homepage_card_3_body",
  ];

  const results = await Promise.all(
    entries.map((key) =>
      client.from("settings").upsert(
        {
          organization_id: organizationId,
          site_key: siteKey,
          key,
          value: String(formData.get(key) || ""),
          type: "text",
          group_name: "general",
          label: key,
          is_public: true,
        },
        {
          onConflict: "organization_id,key",
        },
      ),
    ),
  );

  for (const result of results) {
    assertSupabaseWrite(result.error, "Kunne ikke lagre innstillinger");
  }

  revalidatePath("/");
  revalidatePath("/om-oss");
  revalidatePath("/nyheter");
  revalidatePath("/arrangementer");
  revalidatePath("/dokumenter");
  revalidatePath("/galleri");
  revalidatePath("/kontakt");
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}
