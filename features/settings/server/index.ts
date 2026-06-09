"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSiteKey } from "@/lib/cms/site-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const defaultSettings = {
  site_name: "KIAS CMS",
  logo: "",
  contact_email: "kontakt@example.no",
  phone: "+47 00 00 00 00",
  address: "Eksempelveien 1, 1776 Halden",
  facebook_url: "",
  instagram_url: "",
};

export async function getPublicSettings() {
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();

  if (!client) {
    return defaultSettings;
  }

  const { data } = await client
    .from("settings")
    .select("*")
    .eq("site_key", siteKey)
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
  const client = getSupabaseServerClient();
  const siteKey = getCurrentSiteKey();
  const entries = [
    "site_name",
    "logo",
    "contact_email",
    "phone",
    "address",
    "facebook_url",
    "instagram_url",
  ];

  if (client) {
    await Promise.all(
      entries.map((key) =>
        client.from("settings").upsert({
          id: crypto.randomUUID(),
          site_key: siteKey,
          key,
          value: String(formData.get(key) || ""),
          type: "text",
          group_name: "general",
          label: key,
          is_public: true,
        }),
      ),
    );
  }

  revalidatePath("/");
  revalidatePath("/kontakt");
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}
