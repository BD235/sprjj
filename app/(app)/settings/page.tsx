import Topbar from "@/components/topbar";
import { CardFade } from "@/components/motion/card-fade";
import AccountSettingsDialogs from "./account-settings-dialogs";
import RoleForm from "./role-form";
import { getAuthenticatedUserRecordId, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import { getUsersWithRoles } from "@/lib/services/user-management-service";
import { updateUserRole } from "@/lib/actions/user-management";

export default async function SettingsPage() {
  await requireAnyRole(["PEGAWAI", "OWNER"]);
  const user = await getCurrentUser();
  const userRecordId = await getAuthenticatedUserRecordId();
  const accountRecord = await prisma.user.findUnique({
    where: { id: userRecordId },
    select: { username: true, name: true, email: true },
  });
  const roles = getClaimedRoles(user);
  const isOwner = await getIsOwner(user.id, user.email, roles, user.claims?.userIdDb);
  const managedUsers = isOwner ? await getUsersWithRoles() : [];
  const profileName = accountRecord?.username ?? accountRecord?.name ?? user.name ?? "";
  const accountEmail = accountRecord?.email ?? user.email ?? "—";

  return (
    <>
      <Topbar title="Account Settings" />
      <div className="h-6" />

      <section className="max-w-4xl space-y-6">
        <CardFade className="border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-600">
              Perbarui nama pengguna atau password melalui dialog ketika dibutuhkan.
            </p>
          </div>
          <div className="mt-6 space-y-6">
            <dl className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start justify-between">
                <dt className="font-medium text-gray-500">Nama aktif</dt>
                <dd className="text-right text-gray-900">{profileName || "—"}</dd>
              </div>
              <div className="flex items-start justify-between">
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="text-right text-gray-900">{accountEmail}</dd>
              </div>
              <div className="flex items-start justify-between">
                <dt className="font-medium text-gray-500">Roles</dt>
                <dd className="text-right text-gray-900">{roles.join(", ") || "—"}</dd>
              </div>
            </dl>
            <AccountSettingsDialogs initialUsername={profileName} />
          </div>
        </CardFade>

        {isOwner && (
          <CardFade className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Manajemen Role</h2>
                <p className="text-sm text-gray-500">
                  Atur pengguna yang memiliki akses OWNER atau PEGAWAI.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role Saat Ini</th>
                    <th className="px-3 py-2">Ubah Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {managedUsers.map((managedUser) => {
                    const currentRole = managedUser.roles.includes("OWNER")
                      ? "OWNER"
                      : "PEGAWAI";
                    return (
                      <tr key={managedUser.id} className="bg-white">
                        <td className="px-3 py-3 text-gray-900">{managedUser.name ?? "—"}</td>
                        <td className="px-3 py-3 text-gray-600">{managedUser.email}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                            {currentRole}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <RoleForm
                            userId={managedUser.id}
                            currentRole={currentRole}
                            userName={managedUser.name ?? managedUser.email}
                            updateRoleAction={updateUserRole}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardFade>
        )}
      </section>
    </>
  );
}
