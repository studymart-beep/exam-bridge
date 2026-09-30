"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { setStudentStatus, deleteStudent } from "@/lib/actions/admin/users";

export default function UserActions({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {status !== "active" && (
        <Button
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await setStudentStatus(userId, "active");
              if (!res.success) showToast(res.error || "Failed", "error");
              else {
                showToast("Activated", "success");
                router.refresh();
              }
            })
          }
        >
          Activate
        </Button>
      )}
      {status === "active" && (
        <Button
          size="sm"
          variant="outline"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await setStudentStatus(userId, "inactive");
              if (!res.success) showToast(res.error || "Failed", "error");
              else {
                showToast("Suspended", "success");
                router.refresh();
              }
            })
          }
        >
          Suspend
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
        Delete
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            const res = await deleteStudent(userId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Deleted", "success");
              router.push("/admin/users");
            }
          })
        }
        title="Delete student?"
        message="This removes their profile data."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
