import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { getClaimedRoles, getIsOwner } from "@/lib/role";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);

  return (
    <div className="min-h-screen bg-white transition-colors">
      <Sidebar isOwner={isOwner} />
      <main className="p-4 pb-12 lg:ml-[12rem] lg:p-8 lg:pb-12">{children}</main>
    </div>
  );
}
