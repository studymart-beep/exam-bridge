"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import CbtAttachPanel from "@/components/admin/CbtAttachPanel";
import { adminTopics } from "@/lib/mock/adminTopics";
import { getTopicCbtExamId } from "@/lib/mock/adminTopicCbt";
import { useToast } from "@/components/ui/Toast";

export default function TopicCbtPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const topic = adminTopics.find((t) => t.id === topicId);
  const [examId, setExamId] = useState<string | null>(getTopicCbtExamId(topicId));

  if (!topic) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">
          Topic not found.{" "}
          <Link href="/admin/subjects" className="text-primary">
            Back
          </Link>
        </p>
      </div>
    );
  }

  const backHref = topic.subjectId
    ? `/admin/subjects/${topic.subjectId}/topics`
    : "/admin/subjects";

  return (
    <div>
      <AdminHeader title="Topic CBT" subtitle={topic.title} onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={backHref} className="text-sm text-primary hover:underline">
          ← Back to topics
        </Link>
        <p className="text-sm text-text-secondary">
          Attach one CBT exam to this topic. Students can take it after studying the materials.
        </p>
        <CbtAttachPanel
          attachedExamId={examId}
          createHref={`/admin/cbt?topicId=${topicId}`}
          emptyTitle="This topic has no CBT yet."
          emptyDescription="Create a new CBT for this topic or attach an existing exam."
          onAttach={(id) => {
            // TODO: replace with API call
            setExamId(id);
            showToast("CBT attached", "success");
          }}
          onDetach={() => {
            // TODO: replace with API call
            setExamId(null);
            showToast("CBT detached", "success");
          }}
        />
        <Link href={`/admin/topics/${topicId}/materials`} className="text-sm text-primary hover:underline">
          ← Manage materials
        </Link>
      </div>
    </div>
  );
}
