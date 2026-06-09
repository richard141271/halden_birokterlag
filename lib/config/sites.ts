export const siteRegistry = {
  default: {
    key: "default",
    name: "KIAS CMS",
    description:
      "Gjenbrukbart CMS for organisasjoner, lag og framtidige multisite-oppsett.",
  },
  halden: {
    key: "halden",
    name: "Halden Birøkterlag",
    description:
      "Et modulært CMS bygget for enkel publisering og administrasjon.",
  },
} as const;

export type SiteRegistryKey = keyof typeof siteRegistry;
