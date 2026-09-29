"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TopicForm from "@/components/admin/forms/TopicForm";
import { getAdminSubjectById } from "@/lib/mock/adminSubjects";
import { getAdminTopicsBySubject } from "@/lib/mock/adminTopics";
import type { AdminTopic } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminSubjectTopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const subject = getAdminSubjectById(subjectId);
  const [topics, setTopics] = useState<AdminTopic[]>(getAdminTopicsBySubject(subjectId));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminTopic | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!subject) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-text-muted text-center">Subject not found. <Link href="/admin/subjects" className="text-primary">Back</Link></p>
      </div>
    );
  }

  const handleSave = (data: { title: string; description: string; duration: string }) => {
    // TODO: replace with API call
    if (editing) {
      setTopics((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
      showToast("Topic updated", "success");
    } else {
      setTopics((prev) => [
        ...prev,
        {
          id: `topic-${Date.now()}`,
          courseId: "",
          subjectId,
          ...data,
          order: prev.length + 1,
          published: true,
          hasVideo: false,
          hasPdf: false,
          hasCbt: false,
        },
      ]);
      showToast("Topic added", "success");
    }
    setModal(false);
    setEditing(null);
  };

  return (
    <div>
      <AdminHeader
        title={`${subject.name} — Topics`}
        subtitle={`${topics.length} topics`}
        onMenuClick={openMenu}
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setModal(true); }}>Add topic</Button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-3">
        <Link href="/admin/subjects" className="text-sm text-primary hover:underline">← Back to subjects</Link>
        {topics.map((t) => (
          <Card key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-medium">#{t.order}</span>
                <h3 className="font-heading font-semibold text-text-primary">{t.title}</h3>
                <Badge variant={t.published ? "success" : "default"} size="sm">
                  {t.published ? "Live" : "Draft"}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">{t.duration} · {t.description}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/admin/topics/${t.id}/materials`}>
                <Button size="sm" variant="outline">Manage content</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setModal(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(t.id)}>Delete</Button>
            </div>
          </Card>
        ))}
        {topics.length === 0 && <p className="text-center text-text-muted text-sm py-8">No topics yet</p>}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "Edit topic" : "Add topic"}>
        <TopicForm initial={editing || undefined} onSubmit={handleSave} onCancel={() => { setModal(false); setEditing(null); }} />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          // TODO: replace with API call
          setTopics((prev) => prev.filter((t) => t.id !== deleteId));
          showToast("Topic deleted", "success");
          setDeleteId(null);
        }}
        title="Delete topic?"
        message="This topic will be removed."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
