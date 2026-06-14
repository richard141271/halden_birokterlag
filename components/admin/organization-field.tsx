import { getAdminSession } from "@/lib/auth/session";
import { getCurrentOrganizationId } from "@/lib/cms/site-context";
import { getOrganizationOptions } from "@/features/organizations/server";

export async function OrganizationField({
  value,
}: {
  value?: string | null;
}) {
  const session = await getAdminSession();
  const currentOrganizationId = value || (await getCurrentOrganizationId());

  if (session?.role !== "superadmin") {
    return <input type="hidden" name="organization_id" value={currentOrganizationId} />;
  }

  const organizations = await getOrganizationOptions();

  return (
    <div className="space-y-2">
      <label htmlFor="organization_id" className="text-sm font-medium text-slate-900">
        Organisasjon
      </label>
      <select
        id="organization_id"
        name="organization_id"
        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
        defaultValue={currentOrganizationId}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </div>
  );
}
