"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import CbtAttachPanel from "@/components/admin/CbtAttachPanel";
import { getAdminSubjectById } from "@/lib/mock/adminSubjects";
import { getSubjectCbtExamId } from "@/lib/mock/adminSubjectCbt";
import { useToast } from "@/components/ui/Toast";

export default function SubjectCbtPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const subject = getAdminSubjectById(subjectId);
  const [examId, setExamId] = useState<string | null>(getSubjectCbtExamId(subjectId));

  if (!subject) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">
          Subject not found.{" "}
          <Link href="/admin/subjects" className="text-primary">Back</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="General CBT"
        subtitle={subject.name}
        onMenuClick={openMenu}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={`/admin/subjects/${subjectId}/topics`} className="text-sm text-primary hover:underline">
          ← Back to topics
        </Link>
        <p className="text-sm text-text-secondary">
          General CBT for this subject (final exam). Students can take it from the subject page.
        </p>
        <CbtAttachPanel
          attachedExamId={examId}
          createHref={`/admin/cbt?subjectId=${subjectId}`}
          emptyTitle="This subject has no general CBT yet."
          emptyDescription="Create a new final exam or attach an existing one."
          onAttach={(id) => {
            // TODO: replace with API call
            setExamId(id);
            showToast("Subject CBT attached", "success");
          }}
          onDetach={() => {
            // TODO: replace with API call
            setExamId(null);
            showToast("Subject CBT detached", "success");
          }}
        />
      </div>
    </div>
  );
}
