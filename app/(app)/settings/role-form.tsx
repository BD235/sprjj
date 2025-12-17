"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RoleFormProps {
    userId: string;
    currentRole: string;
    userName: string;
    updateRoleAction: (formData: FormData) => Promise<void>;
}

export default function RoleForm({ userId, currentRole, userName, updateRoleAction }: RoleFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setMessage(null);

        startTransition(async () => {
            try {
                await updateRoleAction(formData);
                setMessage({ type: "success", text: `Role ${userName} berhasil diubah!` });
                router.refresh();

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error instanceof Error ? error.message : "Gagal mengubah role"
                });
            }
        });
    };

    return (
        <div className="space-y-2">
            <form action={handleSubmit} className="flex items-center gap-3">
                <input type="hidden" name="userId" value={userId} />
                <select
                    name="role"
                    defaultValue={currentRole}
                    disabled={isPending}
                    className="rounded-xl border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
                >
                    <option value="PEGAWAI">Pegawai</option>
                    <option value="OWNER">Owner</option>
                </select>
                <Button
                    variant="secondary"
                    size="sm"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
            </form>
            {message && (
                <p
                    className={`text-xs font-medium ${message.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
}
