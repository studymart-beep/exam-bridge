"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createExam } from "@/lib/actions/admin/cbt";

export default function CbtListActions() {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        loading={pending}
        onClick={() => {
          const fd = new FormData();
          fd.set("title", "New exam");
          fd.set("duration_mins", "30");
          fd.set("pass_mark", "50");
          startTransition(async () => {
            const res = await createExam(fd);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Exam created", "success");
              if (res.id) router.push(`/admin/cbt/${res.id}`);
              else router.refresh();
            }
          });
        }}
      >
        Create exam
      </Button>
    </div>
  );
}
