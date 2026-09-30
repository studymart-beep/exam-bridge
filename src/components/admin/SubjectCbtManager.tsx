"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  createGeneralExamForSubject,
  attachGeneralExam,
  detachGeneralExam,
} from "@/lib/actions/admin/cbt";
import type { AdminExamRow } from "@/lib/data/admin/cbt";

export default function SubjectCbtManager({
  subjectId,
  attached,
  candidates,
}: {
  subjectId: string;
  attached: AdminExamRow | null;
  candidates: AdminExamRow[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [attachOpen, setAttachOpen] = useState(false);
  const [detachOpen, setDetachOpen] = useState(false);

  if (attached) {
    return (
      <Card className="space-y-3">
        <h3 className="font-heading font-semibold">{attached.title}</h3>
        <p className="text-sm text-text-muted">
          {attached.question_count} Q · {attached.duration_mins} min · Pass {attached.pass_mark}%
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/cbt/${attached.id}/questions`}>
            <Button size="sm">Edit questions</Button>
          </Link>
          <Button size="sm" variant="danger" onClick={() => setDetachOpen(true)}>
            Detach
          </Button>
        </div>
        <ConfirmDialog
          open={detachOpen}
          onClose={() => setDetachOpen(false)}
          onConfirm={() =>
            startTransition(async () => {
              const res = await detachGeneralExam(attached.id, subjectId);
              if (!res.success) showToast(res.error || "Failed", "error");
              else {
                showToast("Detached", "success");
                router.refresh();
              }
            })
          }
          title="Detach general CBT?"
          message="Students will no longer see a general CBT on this subject."
          confirmLabel="Detach"
          danger
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-4 text-center py-6">
      <p className="text-sm text-text-muted">No general CBT for this subject yet.</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              await createGeneralExamForSubject(subjectId);
            })
          }
        >
          Create new CBT
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAttachOpen(true)}>
          Attach existing
        </Button>
      </div>
      <Modal open={attachOpen} onClose={() => setAttachOpen(false)} title="Attach existing CBT">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {candidates.map((e) => (
            <button
              key={e.id}
              type="button"
              className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-sm"
              onClick={() =>
                startTransition(async () => {
                  const res = await attachGeneralExam(e.id, subjectId);
                  if (!res.success) showToast(res.error || "Failed", "error");
                  else {
                    showToast("Attached", "success");
                    setAttachOpen(false);
                    router.refresh();
                  }
                })
              }
            >
              {e.title}
            </button>
          ))}
        </div>
      </Modal>
    </Card>
  );
}
