"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import AccountProfileForm from "./account-profile-form";
import ChangePasswordForm from "./change-password-form";

interface AccountSettingsDialogsProps {
  initialUsername: string;
}

export default function AccountSettingsDialogs({ initialUsername }: AccountSettingsDialogsProps) {
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const openUsernameModal = () => setIsUsernameModalOpen(true);
  const closeUsernameModal = () => setIsUsernameModalOpen(false);
  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => setIsPasswordModalOpen(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={openUsernameModal} className="flex-1 text-sm" size="sm">
          Ubah Username
        </Button>
        <Button onClick={openPasswordModal} className="flex-1 text-sm" size="sm">
          Ubah Password
        </Button>
      </div>

      <Modal
        open={isUsernameModalOpen}
        onClose={closeUsernameModal}
        title="Ubah Username"
        description="Masukkan nama baru yang ingin ditampilkan di aplikasi."
      >
        <AccountProfileForm
          initialUsername={initialUsername}
          onSuccess={closeUsernameModal}
          onCancel={closeUsernameModal}
        />
      </Modal>

      <Modal
        open={isPasswordModalOpen}
        onClose={closePasswordModal}
        title="Perbarui Password"
        description="Gunakan password yang kuat dan berbeda dari sebelumnya."
      >
        <ChangePasswordForm onSuccess={closePasswordModal} onCancel={closePasswordModal} />
      </Modal>
    </div>
  );
}
