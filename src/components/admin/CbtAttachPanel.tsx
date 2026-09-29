"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminCbtExams } from "@/lib/mock/adminCbtExams";
import { getAdminCbtById } from "@/lib/mock/adminCbtExams";
import type { AdminCbtExam } from "@/types";

interface CbtAttachPanelProps {
  /** Currently attached exam id, or null */
  attachedExamId: string | null;
  onAttach: (examId: string) => void;
  onDetach: () => void;
  /** Link for creating a new CBT (e.g. /admin/cbt?topicId=...) */
  createHref: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function CbtAttachPanel({
  attachedExamId,
  onAttach,
  onDetach,
  createHref,
  emptyTitle = "No CBT attached yet",
  emptyDescription = "Create a new exam or attach an existing one.",
}: CbtAttachPanelProps) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [detachOpen, setDetachOpen] = useState(false);
  const exam: AdminCbtExam | undefined = attachedExamId
    ? getAdminCbtById(attachedExamId)
    : undefined;

  if (!attachedExamId || !exam) {
    return (
      <>
        <Card className="text-center py-8 space-y-4">
          <p className="font-heading font-semibold text-text-primary">{emptyTitle}</p>
          <p className="text-sm text-text-muted">{emptyDescription}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={createHref}>
              <Button>Create new CBT</Button>
            </Link>
            <Button variant="outline" onClick={() => setAttachOpen(true)}>
              Attach existing CBT
            </Button>
          </div>
        </Card>

        <Modal open={attachOpen} onClose={() => setAttachOpen(false)} title="Attach existing CBT">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {adminCbtExams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  // TODO: replace with API call
                  onAttach(e.id);
                  setAttachOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-medium text-text-primary">{e.title}</p>
                <p className="text-xs text-text-muted">
                  {e.subjectName} · {e.questionCount} Q · {e.durationMinutes}m · pass {e.passMark}%
                </p>
              </button>
            ))}
            {adminCbtExams.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No exams available</p>
            )}
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading font-semibold text-text-primary">{exam.title}</h3>
          <Badge variant={exam.status === "published" ? "success" : "warning"}>
            {exam.status}
          </Badge>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-xs text-text-muted">Questions</dt>
            <dd className="font-medium">{exam.questionCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Duration</dt>
            <dd className="font-medium">{exam.durationMinutes} min</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Pass mark</dt>
            <dd className="font-medium">{exam.passMark}%</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Subject</dt>
            <dd className="font-medium">{exam.subjectName}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/cbt/${exam.id}/questions`}>
            <Button size="sm">Edit questions</Button>
          </Link>
          <Link href={`/admin/cbt/${exam.id}`}>
            <Button size="sm" variant="outline">
              Exam details
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={() => setDetachOpen(true)}>
            Detach CBT
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={detachOpen}
        onClose={() => setDetachOpen(false)}
        onConfirm={() => {
          // TODO: replace with API call
          onDetach();
          setDetachOpen(false);
        }}
        title="Detach CBT?"
        message="This exam will no longer be linked here. The exam itself is not deleted."
        confirmLabel="Detach"
        danger
      />
    </>
  );
}
